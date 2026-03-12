const express = require('express');
const router = express.Router();
const {
    createEvent,
    getEvents,
    getEventById,
    getMyEvents,
    updateEvent,
    updateEventStatus,
    deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getEvents);
router.get('/my-events', protect, getMyEvents);
router.get('/:id', getEventById);
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.patch('/:id/status', protect, updateEventStatus);
router.delete('/:id', protect, deleteEvent);

module.exports = router;
