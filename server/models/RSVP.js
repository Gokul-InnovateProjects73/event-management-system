const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

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
        ticketType: {
            type: String,
            default: 'General',
        },
        personalInfo: {
            fullName: { type: String, default: '' },
            dob: { type: String, default: '' },
            gender: { type: String, default: '' },
            studentId: { type: String, default: '' },
        },
        contactDetails: {
            email: { type: String, default: '' },
            phone: { type: String, default: '' },
            address: { type: String, default: '' },
        },
        academicInfo: {
            department: { type: String, default: '' },
            yearLevel: { type: String, default: '' },
            college: { type: String, default: '' },
        },
        eventSpecifics: {
            session: { type: String, default: '' },
            dietary: { type: String, default: '' },
            tshirtSize: { type: String, default: '' },
        },
        emergencyContact: {
            name: { type: String, default: '' },
            phone: { type: String, default: '' },
        },
        department: {
            type: String,
            default: '',
        },
        checkInToken: {
            type: String,
            default: () => uuidv4(),
            unique: true,
        },
        checkedIn: {
            type: Boolean,
            default: false,
        },
        checkedInAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// One RSVP per user per event
rsvpSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('RSVP', rsvpSchema);
