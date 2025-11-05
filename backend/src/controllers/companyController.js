const { firestoreHelper } = require('../config/firebase');

// Get company dashboard
const getDashboard = async (req, res) => {
  try {
    const companyId = req.user.id;

    // Get company data
    const company = {
      id: req.user.id,
      name: req.user.companyName || req.user.name,
      email: req.user.email,
      verificationStatus: req.user.verificationStatus || 'verified'
    };
    
    // Get company's jobs
    const jobs = await firestoreHelper.getJobsByCompany(companyId);
    
    // For now, return mock applications (you can implement this later)
    const applications = [];

    // Calculate stats
    const stats = {
      totalJobs: jobs.length,
      totalApplications: applications.length,
      openJobs: jobs.filter(job => job.status === 'open').length,
      closedJobs: jobs.filter(job => job.status === 'closed').length
    };

    res.json({
      success: true,
      data: {
        company,
        jobs,
        applications,
        stats
      }
    });

  } catch (error) {
    console.error('Get company dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving company dashboard'
    });
  }
};

// Get company jobs
const getJobs = async (req, res) => {
  try {
    const companyId = req.user.id;
    const jobs = await firestoreHelper.getJobsByCompany(companyId);
    
    res.json({
      success: true,
      data: jobs
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving jobs'
    });
  }
};

// Create new job
const createJob = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { title, description, requirements, location, salary, type, deadline } = req.body;

    if (!title || !description || !requirements) {
      return res.status(400).json({
        success: false,
        message: 'Job title, description, and requirements are required'
      });
    }

    const jobData = {
      title,
      description,
      requirements: Array.isArray(requirements) ? requirements : [requirements],
      location: location || 'Remote',
      salary: salary || 'Negotiable',
      type: type || 'full-time',
      companyId,
      status: 'open',
      postedDate: new Date().toISOString(),
      deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };

    const job = await firestoreHelper.createJob(jobData);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });

  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job'
    });
  }
};

// Get job applicants (mock for now)
const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Mock applicants data - you can implement real applicant tracking later
    const applicants = [
      {
        id: 'app-001',
        name: 'John Doe',
        email: 'john@example.com',
        appliedDate: new Date().toISOString(),
        status: 'pending',
        qualifications: ['Computer Science Degree', '2 years experience']
      },
      {
        id: 'app-002', 
        name: 'Jane Smith',
        email: 'jane@example.com',
        appliedDate: new Date().toISOString(),
        status: 'reviewed',
        qualifications: ['Business Administration', 'Project Management']
      }
    ];

    res.json({
      success: true,
      data: applicants
    });

  } catch (error) {
    console.error('Get job applicants error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving job applicants'
    });
  }
};

// Update job status
const updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;

    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: open or closed'
      });
    }

    await db.collection('jobs').doc(jobId).update({ status });

    res.json({
      success: true,
      message: `Job status updated to ${status}`
    });

  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job status'
    });
  }
};

// Update company profile
const updateProfile = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { companyName, description, industry, website, contactInfo } = req.body;

    const updates = {};
    if (companyName) updates.companyName = companyName;
    if (description) updates.description = description;
    if (industry) updates.industry = industry;
    if (website) updates.website = website;
    if (contactInfo) updates.contactInfo = contactInfo;

    await firestoreHelper.updateUser(companyId, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

module.exports = {
  getDashboard,
  getJobs,
  createJob,
  getJobApplicants,
  updateJobStatus,
  updateProfile
};