const RSVP = require('../models/RSVP');
const Event = require('../models/Event');

// @desc  Submit or update RSVP
// @route POST /api/rsvps
const submitRSVP = async (req, res) => {
    try {
        const { eventId, status, note } = req.body;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const rsvp = await RSVP.findOneAndUpdate(
            { event: eventId, user: req.user._id },
            { status, note },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

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
            .populate('user', 'name email')
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

module.exports = { submitRSVP, getRSVPsForEvent, getMyRSVP, getMyRSVPEvents };
