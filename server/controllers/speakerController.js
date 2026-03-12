const Speaker = require('../models/Speaker');
const Event = require('../models/Event');

// @desc  Get speakers for an event
// @route GET /api/speakers?event=:id
const getSpeakers = async (req, res) => {
    try {
        const { event } = req.query;
        const filter = event ? { event } : {};
        const speakers = await Speaker.find(filter).sort({ createdAt: 1 });
        res.json(speakers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Create speaker
// @route POST /api/speakers
const createSpeaker = async (req, res) => {
    try {
        const { name, bio, photo, title, company, eventId } = req.body;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const isOrganizer = event.organizer.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOrganizer && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const speaker = await Speaker.create({
            name, bio, photo, title, company,
            event: eventId,
            addedBy: req.user._id,
        });

        // Add speaker ref to event
        event.speakers.push(speaker._id);
        await event.save();

        res.status(201).json(speaker);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Delete speaker
// @route DELETE /api/speakers/:id
const deleteSpeaker = async (req, res) => {
    try {
        const speaker = await Speaker.findById(req.params.id);
        if (!speaker) return res.status(404).json({ message: 'Speaker not found' });

        const event = await Event.findById(speaker.event);
        const isOrganizer = event && event.organizer.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOrganizer && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Remove from event speakers array
        if (event) {
            event.speakers = event.speakers.filter(s => s.toString() !== speaker._id.toString());
            await event.save();
        }

        await Speaker.findByIdAndDelete(req.params.id);
        res.json({ message: 'Speaker removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSpeakers, createSpeaker, deleteSpeaker };
