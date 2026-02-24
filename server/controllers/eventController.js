const Event = require('../models/Event');
const RSVP = require('../models/RSVP');

// @desc  Create an event
// @route POST /api/events
const createEvent = async (req, res) => {
    try {
        const { title, description, location, date, endDate, category, capacity, imageUrl, isPublic } = req.body;
        const event = await Event.create({
            title,
            description,
            location,
            date,
            endDate,
            category,
            capacity,
            imageUrl,
            isPublic,
            organizer: req.user._id,
        });
        const populated = await event.populate('organizer', 'name email');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get all public events
// @route GET /api/events
const getEvents = async (req, res) => {
    try {
        const { category, search } = req.query;
        const filter = { isPublic: true };
        if (category && category !== 'all') filter.category = category;
        if (search) filter.title = { $regex: search, $options: 'i' };

        const events = await Event.find(filter)
            .populate('organizer', 'name email')
            .sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get single event by ID
// @route GET /api/events/:id
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'name email');
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get events created by logged-in user
// @route GET /api/events/my-events
const getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user._id })
            .populate('organizer', 'name email')
            .sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Update an event
// @route PUT /api/events/:id
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('organizer', 'name email');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Delete an event
// @route DELETE /api/events/:id
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await Event.findByIdAndDelete(req.params.id);
        await RSVP.deleteMany({ event: req.params.id });
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createEvent, getEvents, getEventById, getMyEvents, updateEvent, deleteEvent };
