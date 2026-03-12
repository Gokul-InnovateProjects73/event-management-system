const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const User = require('../models/User');

// @desc  Overall analytics overview
// @route GET /api/analytics/overview
const getOverview = async (req, res) => {
    try {
        const [totalEvents, totalRSVPs, totalUsers, checkedIn] = await Promise.all([
            Event.countDocuments(),
            RSVP.countDocuments({ status: 'attending' }),
            User.countDocuments(),
            RSVP.countDocuments({ checkedIn: true }),
        ]);

        // Most popular event by RSVP count
        const popular = await RSVP.aggregate([
            { $match: { status: 'attending' } },
            { $group: { _id: '$event', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
            { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
            { $unwind: '$event' },
            { $project: { _id: 0, title: '$event.title', count: 1, eventId: '$event._id' } },
        ]);

        // Check-in rate
        const totalAttending = await RSVP.countDocuments({ status: 'attending' });
        const checkInRate = totalAttending > 0
            ? Math.round((checkedIn / totalAttending) * 100)
            : 0;

        res.json({
            totalEvents,
            totalRSVPs,
            totalUsers,
            checkedIn,
            checkInRate,
            mostPopular: popular[0] || null,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Registrations over the last 30 days
// @route GET /api/analytics/registrations-over-time
const getRegistrationsOverTime = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const data = await RSVP.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Events and attendees grouped by category
// @route GET /api/analytics/by-category
const getByCategory = async (req, res) => {
    try {
        const events = await Event.aggregate([
            { $group: { _id: '$category', eventCount: { $sum: 1 } } },
        ]);

        const rsvps = await RSVP.aggregate([
            { $match: { status: 'attending' } },
            {
                $lookup: {
                    from: 'events',
                    localField: 'event',
                    foreignField: '_id',
                    as: 'event',
                },
            },
            { $unwind: '$event' },
            { $group: { _id: '$event.category', attendeeCount: { $sum: 1 } } },
        ]);

        // Merge by category
        const categoryMap = {};
        events.forEach(e => {
            categoryMap[e._id] = { category: e._id, eventCount: e.eventCount, attendeeCount: 0 };
        });
        rsvps.forEach(r => {
            if (categoryMap[r._id]) {
                categoryMap[r._id].attendeeCount = r.attendeeCount;
            } else {
                categoryMap[r._id] = { category: r._id, eventCount: 0, attendeeCount: r.attendeeCount };
            }
        });

        res.json(Object.values(categoryMap));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Recent activity (latest RSVPs)
// @route GET /api/analytics/recent-activity
const getRecentActivity = async (req, res) => {
    try {
        const rsvps = await RSVP.find()
            .populate('user', 'name avatar')
            .populate({ path: 'event', select: 'title date' })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(rsvps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getOverview, getRegistrationsOverTime, getByCategory, getRecentActivity };
