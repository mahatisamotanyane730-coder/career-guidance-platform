const express = require('express');
const {
  getDashboard,
  getJobs,
  createJob,
  getJobApplicants,
  updateJobStatus,
  updateProfile
} = require('../controllers/companyController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All company routes require authentication and company role
router.use(authenticate);
router.use(authorize('company'));

// Dashboard
router.get('/dashboard', getDashboard);

// Job management
router.get('/jobs', getJobs);
router.post('/jobs', createJob);
router.get('/jobs/:jobId/applicants', getJobApplicants);
router.patch('/jobs/:jobId/status', updateJobStatus);

// Profile management
router.put('/profile', updateProfile);

module.exports = router;