const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role) =>
    jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

const formatUser = (user, token) => ({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    rollNumber: user.rollNumber || '',
    department: user.department || '',
    phone: user.phone,
    bio: user.bio,
    avatar: user.avatar,
    ...(token ? { token } : {}),
});

// @desc  Register new user
// @route POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password, role, rollNumber, department } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        const userRole = role === 'admin' ? 'admin' : 'student';

        // Validate student-specific fields
        if (userRole === 'student') {
            if (!rollNumber || !rollNumber.trim()) {
                return res.status(400).json({ message: 'Roll number is required for students' });
            }
            if (!department || !department.trim()) {
                return res.status(400).json({ message: 'Department is required for students' });
            }
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: userRole,
            rollNumber: userRole === 'student' ? rollNumber.trim() : '',
            department: userRole === 'student' ? department.trim() : '',
        });

        res.status(201).json(formatUser(user, generateToken(user._id, user.role)));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json(formatUser(user, generateToken(user._id, user.role)));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json(formatUser(user));
};

// @desc  Update current user profile
// @route PATCH /api/auth/profile
const updateProfile = async (req, res) => {
    try {
        const { name, phone, bio, avatar } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, phone, bio, avatar },
            { new: true, runValidators: true }
        );
        res.json(formatUser(user));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get all users (admin only)
// @route GET /api/auth/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { register, login, getMe, updateProfile, getAllUsers };
