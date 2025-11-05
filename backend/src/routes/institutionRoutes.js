const express = require('express');
const { 
  getInstitutions, 
  getInstitution, 
  getCourses, 
  getCoursesByInstitution,
  getInstitutionDashboard 
} = require('../controllers/institutionController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getInstitutions);
router.get('/:id', getInstitution);
router.get('/:id/courses', getCoursesByInstitution);
router.get('/courses/all', getCourses);

// Protected routes
router.get('/dashboard', authenticate, authorize('institution'), getInstitutionDashboard);

module.exports = router;