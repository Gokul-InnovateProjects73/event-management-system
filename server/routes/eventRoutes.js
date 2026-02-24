const express = require('express');
const router = express.Router();
const {
    createEvent,
    getEvents,
    getEventById,
    getMyEvents,
    updateEvent,
    deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getEvents);
router.get('/my-events', protect, getMyEvents);
router.get('/:id', getEventById);
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;
