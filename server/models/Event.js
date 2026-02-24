const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
        },
        endDate: {
            type: Date,
        },
        category: {
            type: String,
            enum: ['conference', 'workshop', 'social', 'sports', 'music', 'other'],
            default: 'other',
        },
        capacity: {
            type: Number,
            default: 100,
        },
        imageUrl: {
            type: String,
            default: '',
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
