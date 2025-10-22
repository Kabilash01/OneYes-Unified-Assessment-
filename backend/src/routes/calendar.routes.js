/**
 * Calendar Routes
 */

const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const authMiddleware = require('../middlewares/authMiddleware');
const { adminAuth } = require('../middlewares/adminAuth');

// Protect all routes
router.use(authMiddleware);

// Student calendar
router.get('/student/:studentId', calendarController.getStudentCalendar);

// Instructor calendar
router.get('/instructor/:instructorId', calendarController.getInstructorCalendar);

// Admin calendar (admin only)
router.get('/admin', adminAuth, calendarController.getAdminCalendar);

// Get events by date range (flexible)
router.get('/events', calendarController.getEventsByDateRange);

// Update assessment date (instructor/admin only)
router.patch('/assessment/:id/date', calendarController.updateAssessmentDate);

// Export calendar to iCal
router.get('/export/:userId', calendarController.exportCalendar);

module.exports = router;
