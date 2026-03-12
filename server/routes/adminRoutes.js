const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const { 
    getStats, 
    getStudents, 
    getEventRSVPs, 
    getRSVPsByDept, 
    getAllRegistrations,
    getAllUsers,
    updateUser,
    deleteUser,
    getStudentRSVPs
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/students', getStudents);
router.get('/students/:id/rsvps', getStudentRSVPs);
router.get('/events/:id/rsvps', getEventRSVPs);
router.get('/rsvps-by-dept', getRSVPsByDept);
router.get('/registrations', getAllRegistrations);

// User Management Routes
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
