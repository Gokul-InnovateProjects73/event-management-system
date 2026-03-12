const express = require('express');
const router = express.Router();
const {
    submitRSVP,
    getRSVPsForEvent,
    getMyRSVP,
    getMyRSVPEvents,
    checkIn,
    exportRSVPs
} = require('../controllers/rsvpController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitRSVP);
router.post('/checkin', protect, checkIn);
router.get('/my-events', protect, getMyRSVPEvents);
router.get('/event/:eventId', protect, getRSVPsForEvent);
router.get('/export/:eventId', protect, exportRSVPs);
router.get('/my/:eventId', protect, getMyRSVP);

module.exports = router;
