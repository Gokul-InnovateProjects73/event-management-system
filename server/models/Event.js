const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    capacity: { type: Number, default: 50 },
    sold: { type: Number, default: 0 },
}, { _id: false });

const agendaItemSchema = new mongoose.Schema({
    time: { type: String, default: '' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
}, { _id: false });

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
        // New fields
        status: {
            type: String,
            enum: ['draft', 'published', 'cancelled'],
            default: 'published',
        },
        time: { type: String, default: '' },
        tags: [{ type: String }],
        virtualLink: { type: String, default: '' },
        budget: { type: Number, default: 0 },
        ticketTypes: [ticketTypeSchema],
        agenda: [agendaItemSchema],
        speakers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Speaker' }],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
