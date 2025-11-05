const express = require('express');
const { getJobs, applyForJob } = require('../controllers/jobController');
const { authenticate, authorize } = require('../middleware/auth');


const router = express.Router();

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
router.get('/', getJobs);

// @desc    Apply for job
// @route   POST /api/jobs/apply
// @access  Private (Student)
router.post('/apply', authenticate, authorize('student'), applyForJob);

module.exports = router;