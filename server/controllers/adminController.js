const User = require('../models/User');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');

// @desc  Get overall stats
// @route GET /api/admin/stats
const getStats = async (req, res) => {
    try {
        const [totalEvents, totalRSVPs, totalStudents] = await Promise.all([
            Event.countDocuments(),
            RSVP.countDocuments(),
            User.countDocuments({ role: 'student' }),
        ]);
        res.json({ totalEvents, totalRSVPs, totalStudents });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get all students (optionally filtered by dept)
// @route GET /api/admin/students?dept=CSE
const getStudents = async (req, res) => {
    try {
        const { dept } = req.query;
        const filter = { role: 'student' };
        if (dept && dept !== 'all') filter.department = dept;

        const students = await User.find(filter)
            .select('-password')
            .sort({ department: 1, name: 1 });

        // Attach RSVP count per student
        const withCounts = await Promise.all(
            students.map(async (s) => {
                const rsvpCount = await RSVP.countDocuments({ user: s._id });
                return { ...s.toObject(), rsvpCount };
            })
        );

        res.json(withCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get RSVPs for a specific event (with student details)
// @route GET /api/admin/events/:id/rsvps
const getEventRSVPs = async (req, res) => {
    try {
        const rsvps = await RSVP.find({ event: req.params.id })
            .populate('user', 'name email rollNumber department avatar')
            .sort({ department: 1, createdAt: 1 });
        res.json(rsvps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get RSVPs grouped by department for all events (dashboard chart)
// @route GET /api/admin/rsvps-by-dept
const getRSVPsByDept = async (req, res) => {
    try {
        const result = await RSVP.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get all RSVPs (registrations) across all events
// @route GET /api/admin/registrations
const getAllRegistrations = async (req, res) => {
    try {
        const registrations = await RSVP.find()
            .populate('user', 'name email rollNumber department phone')
            .populate('event', 'title date location')
            .sort({ createdAt: -1 });
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get all users (admin user management)
// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Update user details (admin)
// @route PUT /api/admin/users/:id
const updateUser = async (req, res) => {
    try {
        const { name, email, role, department, rollNumber, phone } = req.body;
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.department = department !== undefined ? department : user.department;
        user.rollNumber = rollNumber !== undefined ? rollNumber : user.rollNumber;
        user.phone = phone !== undefined ? phone : user.phone;

        const updatedUser = await user.save();
        
        // Remove password from response
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.json(userResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Delete a user (admin)
// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Don't let admins delete themselves easily to prevent lockouts
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own account while logged in' });
        }

        // Delete associated RSVPs (cascade)
        await RSVP.deleteMany({ user: user._id });
        
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get RSVPs for a specific student
// @route GET /api/admin/students/:id/rsvps
const getStudentRSVPs = async (req, res) => {
    try {
        const rsvps = await RSVP.find({ user: req.params.id })
            .populate('event', 'title date location')
            .sort({ createdAt: -1 });
        res.json(rsvps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getStats, 
    getStudents, 
    getEventRSVPs, 
    getRSVPsByDept, 
    getAllRegistrations,
    getAllUsers,
    updateUser,
    deleteUser,
    getStudentRSVPs
};
