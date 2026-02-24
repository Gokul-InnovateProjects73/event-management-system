const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['attending', 'maybe', 'not_attending'],
            default: 'attending',
        },
        note: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

// One RSVP per user per event
rsvpSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('RSVP', rsvpSchema);
