const express = require('express');
const router = express.Router();
const {
    submitRSVP,
    getRSVPsForEvent,
    getMyRSVP,
    getMyRSVPEvents,
} = require('../controllers/rsvpController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitRSVP);
router.get('/my-events', protect, getMyRSVPEvents);
router.get('/event/:eventId', protect, getRSVPsForEvent);
router.get('/my/:eventId', protect, getMyRSVP);

module.exports = router;
