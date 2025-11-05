const { firestoreHelper } = require('../config/firebase');

// Get all applications
const getApplications = async (req, res) => {
  try {
    const applications = await firestoreHelper.getAllApplications();
    
    res.json({
      success: true,
      data: applications
    });
    
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications'
    });
  }
};

// Get single application
const getApplication = async (req, res) => {
  try {
    const { id } = req.params;
    
    // This would get a specific application
    // For now, return not found
    res.status(404).json({
      success: false,
      message: 'Application not found'
    });
    
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application'
    });
  }
};

// Create application
const createApplication = async (req, res) => {
  try {
    const applicationData = {
      ...req.body,
      status: 'pending',
      applicationDate: new Date().toISOString()
    };
    
    const application = await firestoreHelper.createApplication(applicationData);
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
    
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application'
    });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'admitted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    await firestoreHelper.updateApplicationStatus(id, status);
    
    res.json({
      success: true,
      message: 'Application status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status'
    });
  }
};

module.exports = {
  getApplications,
  getApplication,
  createApplication,
  updateApplicationStatus
};