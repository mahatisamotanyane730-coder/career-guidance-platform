const express = require('express');
const { 
  getDashboard,
  getRecentActivity,
  getInstitutions,
  getCompanies,
  getUsers,
  updateInstitutionStatus,
  updateCompanyStatus,
  updateUserStatus,
  getSystemReports
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard and analytics
router.get('/dashboard', getDashboard);
router.get('/recent-activity', getRecentActivity);

// Management routes
router.get('/institutions', getInstitutions);
router.get('/companies', getCompanies);
router.get('/users', getUsers);

// Status update routes
router.patch('/institutions/:id/status', updateInstitutionStatus);
router.patch('/companies/:id/status', updateCompanyStatus);
router.patch('/users/:id/status', updateUserStatus);

// Reports
router.get('/reports', getSystemReports);

module.exports = router;