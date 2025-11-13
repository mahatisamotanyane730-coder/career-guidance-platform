// backend/src/routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const {
  getStudentApplications,
  applyForCourse,
  getDashboard,
  uploadTranscript,
  getTranscript,
  acceptAdmission,
  getQualifiedCourses,
  getAvailableJobs,
  applyForJob,
  getMyJobApplications
} = require('../controllers/studentController');
const { auth } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Application routes
router.get('/applications', getStudentApplications);
router.post('/applications', applyForCourse);

// Dashboard routes
router.get('/dashboard', getDashboard);

// Transcript routes
router.post('/transcript', uploadTranscript);
router.get('/transcript', getTranscript);

// Admission routes
router.post('/admission/accept', acceptAdmission);

// Course qualification routes
router.get('/qualified-courses', getQualifiedCourses);

// Job routes
router.get('/jobs', getAvailableJobs);
router.post('/jobs/apply', applyForJob);
router.get('/job-applications', getMyJobApplications);

module.exports = router;