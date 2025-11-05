const express = require('express');

// Import route files
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const institutionRoutes = require('./institutionRoutes');
const studentRoutes = require('./studentRoutes');
const companyRoutes = require('./companyRoutes');
const applicationRoutes = require('./applicationRoutes');
const jobRoutes = require('./jobRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Career Guidance API is running!',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API test successful!',
    data: {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/institutions', institutionRoutes);
router.use('/students', studentRoutes);
router.use('/companies', companyRoutes);
router.use('/applications', applicationRoutes);
router.use('/jobs', jobRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`
  });
});

module.exports = router;