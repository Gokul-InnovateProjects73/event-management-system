const express = require('express');
const router = express.Router();
const { getSpeakers, createSpeaker, deleteSpeaker } = require('../controllers/speakerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getSpeakers);
router.post('/', protect, createSpeaker);
router.delete('/:id', protect, deleteSpeaker);

module.exports = router;
