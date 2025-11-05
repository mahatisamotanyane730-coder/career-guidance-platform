const express = require('express');
const { 
  getDashboard, 
  getStudentApplications, 
  applyForCourse,
  getAvailableJobs,
  applyForJob,
  getMyJobApplications
} = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @desc    Get student dashboard
// @route   GET /api/students/dashboard
// @access  Private (Student)
router.get('/dashboard', authorize('student'), getDashboard);

// @desc    Get student applications
// @route   GET /api/students/applications
// @access  Private (Student)
router.get('/applications', authorize('student'), getStudentApplications);

// @desc    Apply for course
// @route   POST /api/students/applications
// @access  Private (Student)
router.post('/applications', authorize('student'), applyForCourse);

// JOB ROUTES - NEW
// @desc    Get available jobs
// @route   GET /api/students/jobs
// @access  Private (Student)
router.get('/jobs', authorize('student'), getAvailableJobs);

// @desc    Apply for job
// @route   POST /api/students/jobs/apply
// @access  Private (Student)
router.post('/jobs/apply', authorize('student'), applyForJob);

// @desc    Get student's job applications
// @route   GET /api/students/job-applications
// @access  Private (Student)
router.get('/job-applications', authorize('student'), getMyJobApplications);

module.exports = router;