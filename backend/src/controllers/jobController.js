const { firestoreHelper } = require('../config/firebase');

// Get all jobs
const getJobs = async (req, res) => {
  try {
    const jobs = await firestoreHelper.getAllJobs();
    
    res.json({
      success: true,
      data: jobs
    });
    
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs'
    });
  }
};

// Apply for job
const applyForJob = async (req, res) => {
  try {
    const applicationData = {
      ...req.body,
      studentId: req.user.id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };
    
    // This would create a job application
    // For now, return success
    res.json({
      success: true,
      message: 'Job application submitted successfully'
    });
    
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying for job'
    });
  }
};

module.exports = {
  getJobs,
  applyForJob
};