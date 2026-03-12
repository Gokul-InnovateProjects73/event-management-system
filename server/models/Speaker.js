const mongoose = require('mongoose');

const speakerSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        bio: { type: String, default: '' },
        photo: { type: String, default: '' },
        title: { type: String, default: '' },
        company: { type: String, default: '' },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Speaker', speakerSchema);
