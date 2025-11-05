const express = require('express');
const { 
  getApplications, 
  getApplication, 
  updateApplicationStatus,
  createApplication 
} = require('../controllers/applicationController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all applications (for admin/institution)
// @route   GET /api/applications
// @access  Private (Admin/Institution)
router.get('/', authenticate, authorize(['admin', 'institution']), getApplications);

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private (Admin/Institution/Student - their own)
router.get('/:id', authenticate, getApplication);

// @desc    Create new application (public route for students)
// @route   POST /api/applications
// @access  Public (students will be authenticated via student routes)
router.post('/', createApplication);

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Admin/Institution)
router.patch('/:id/status', authenticate, authorize(['admin', 'institution']), updateApplicationStatus);

module.exports = router;