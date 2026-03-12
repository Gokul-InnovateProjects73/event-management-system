const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendRegistrationConfirmation } = require('../utils/emailService');

// @desc  Submit or update RSVP
// @route POST /api/rsvps
const submitRSVP = async (req, res) => {
    try {
        const {
            eventId, status, note, ticketType,
            personalInfo, contactDetails, academicInfo, eventSpecifics, emergencyContact
        } = req.body;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check if updating existing RSVP
        const existing = await RSVP.findOne({ event: eventId, user: req.user._id });

        // Capacity enforcement — only for NEW "attending" RSVPs
        if (!existing && status === 'attending' && event.capacity) {
            const attendingCount = await RSVP.countDocuments({ event: eventId, status: 'attending' });
            if (attendingCount >= event.capacity) {
                return res.status(400).json({ message: 'Event is full' });
            }
        }

        let rsvp;
        if (existing) {
            existing.status = status;
            existing.note = note;
            if (ticketType) existing.ticketType = ticketType;
            if (personalInfo) existing.personalInfo = personalInfo;
            if (contactDetails) existing.contactDetails = contactDetails;
            if (academicInfo) existing.academicInfo = academicInfo;
            if (eventSpecifics) existing.eventSpecifics = eventSpecifics;
            if (emergencyContact) existing.emergencyContact = emergencyContact;
            await existing.save();
            rsvp = existing;
        } else {
            // Fetch department from user for denormalization
            const userDoc = await User.findById(req.user._id).select('department');
            rsvp = await RSVP.create({
                event: eventId,
                user: req.user._id,
                status,
                note,
                ticketType: ticketType || 'General',
                department: userDoc?.department || '',
                personalInfo: personalInfo || {},
                contactDetails: contactDetails || {},
                academicInfo: academicInfo || {},
                eventSpecifics: eventSpecifics || {},
                emergencyContact: emergencyContact || {},
            });

            // Increment sold count on ticket type
            if (ticketType && event.ticketTypes && event.ticketTypes.length > 0) {
                const tt = event.ticketTypes.find(t => t.name === ticketType);
                if (tt) {
                    tt.sold = (tt.sold || 0) + 1;
                    await event.save();
                }
            }

            // Create notification for the user
            await Notification.create({
                user: req.user._id,
                message: `You have successfully RSVP'd to "${event.title}"`,
                type: 'rsvp',
                link: `/events/${eventId}`,
            });

            // Notify organizer
            await Notification.create({
                user: event.organizer,
                message: `A new attendee RSVP'd to your event "${event.title}"`,
                type: 'rsvp',
                link: `/events/${eventId}`,
            });
        }

        // Send Email Confirmation if they are actively attending
        if (status === 'attending') {
            const userDoc = await User.findById(req.user._id);
            const studentName = personalInfo?.fullName || userDoc.name;
            const toMail = contactDetails?.email || userDoc.email;

            if (toMail) {
                // We send it asynchronously without awaiting to not block the API response
                sendRegistrationConfirmation({
                    toMail,
                    studentName,
                    event,
                    checkInToken: rsvp.checkInToken,
                    ticketDetails: { ticketType: rsvp.ticketType }
                });
            }
        }

        res.status(200).json(rsvp);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get all RSVPs for an event
// @route GET /api/rsvps/event/:eventId
const getRSVPsForEvent = async (req, res) => {
    try {
        const rsvps = await RSVP.find({ event: req.params.eventId })
            .populate('user', 'name email avatar')
            .sort({ createdAt: -1 });
        res.json(rsvps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get user's RSVP for a specific event
// @route GET /api/rsvps/my/:eventId
const getMyRSVP = async (req, res) => {
    try {
        const rsvp = await RSVP.findOne({
            event: req.params.eventId,
            user: req.user._id,
        });
        res.json(rsvp || null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get all events the user has RSVP'd to
// @route GET /api/rsvps/my-events
const getMyRSVPEvents = async (req, res) => {
    try {
        const rsvps = await RSVP.find({ user: req.user._id })
            .populate({
                path: 'event',
                populate: { path: 'organizer', select: 'name email' },
            })
            .sort({ createdAt: -1 });
        res.json(rsvps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Check-in by token
// @route POST /api/rsvps/checkin
const checkIn = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Token is required' });

        const rsvp = await RSVP.findOne({ checkInToken: token })
            .populate('user', 'name email avatar')
            .populate({ path: 'event', select: 'title date location' });

        if (!rsvp) return res.status(404).json({ message: 'Invalid check-in token' });
        if (rsvp.checkedIn) {
            return res.status(200).json({ message: 'Already checked in', rsvp, alreadyCheckedIn: true });
        }

        rsvp.checkedIn = true;
        rsvp.checkedInAt = new Date();
        await rsvp.save();

        // Notify user
        await Notification.create({
            user: rsvp.user._id,
            message: `You have been checked in to "${rsvp.event.title}"`,
            type: 'checkin',
            link: `/events/${rsvp.event._id}`,
        });

        res.json({ message: 'Check-in successful', rsvp });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Export RSVPs for an event to CSV
// @route GET /api/rsvps/export/:eventId
const exportRSVPs = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const rsvps = await RSVP.find({ event: eventId })
            .populate('user', 'name email rollNumber department')
            .sort({ createdAt: -1 });

        if (!rsvps || rsvps.length === 0) {
            return res.status(404).json({ message: 'No registrations found for this event' });
        }

        const event = await Event.findById(eventId).select('title');

        // CSV Header
        let csv = 'Status,Ticket Type,RSVP Note,Checked In,User Name,User Email,User Roll No,User Dept,Full Name,DOB,Gender,Student ID,Phone,Alt Email,Address,Academic Dept,Year Level,College,Session,Dietary,T-Shirt Size,Emergency Name,Emergency Phone\n';

        rsvps.forEach(r => {
            const safeStr = (str) => `"${(str || '').toString().replace(/"/g, '""')}"`;

            const row = [
                r.status,
                r.ticketType,
                r.note,
                r.checkedIn ? 'Yes' : 'No',
                r.user?.name,
                r.user?.email,
                r.user?.rollNumber,
                r.user?.department,
                r.personalInfo?.fullName,
                r.personalInfo?.dob,
                r.personalInfo?.gender,
                r.personalInfo?.studentId,
                r.contactDetails?.phone,
                r.contactDetails?.email,
                r.contactDetails?.address,
                r.academicInfo?.department,
                r.academicInfo?.yearLevel,
                r.academicInfo?.college,
                r.eventSpecifics?.session,
                r.eventSpecifics?.dietary,
                r.eventSpecifics?.tshirtSize,
                r.emergencyContact?.name,
                r.emergencyContact?.phone
            ].map(safeStr).join(',');

            csv += row + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="registrations_${event?.title || eventId}.csv"`);
        res.status(200).send(csv);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { submitRSVP, getRSVPsForEvent, getMyRSVP, getMyRSVPEvents, checkIn, exportRSVPs };
