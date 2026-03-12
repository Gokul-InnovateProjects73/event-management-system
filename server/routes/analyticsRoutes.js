const express = require('express');
const router = express.Router();
const { getOverview, getRegistrationsOverTime, getByCategory, getRecentActivity } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/overview', protect, getOverview);
router.get('/registrations-over-time', protect, getRegistrationsOverTime);
router.get('/by-category', protect, getByCategory);
router.get('/recent-activity', protect, getRecentActivity);

module.exports = router;
