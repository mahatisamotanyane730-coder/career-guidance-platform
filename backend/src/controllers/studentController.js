const { db } = require('../config/firebase');

// @desc    Get student applications
// @route   GET /api/students/applications
// @access  Private (Student)
const getStudentApplications = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    console.log('📋 Fetching applications for student:', studentId);
    
    const applicationsSnapshot = await db.collection('applications')
      .where('studentId', '==', studentId)
      .get();
    
    if (applicationsSnapshot.empty) {
      return res.json({
        success: true,
        message: 'No applications found',
        data: []
      });
    }
    
    const applications = [];
    applicationsSnapshot.forEach(doc => {
      const appData = doc.data();
      applications.push({
        id: doc.id,
        studentId: appData.studentId,
        courseId: appData.courseId,
        institutionId: appData.institutionId,
        studentName: appData.studentName,
        studentEmail: appData.studentEmail,
        courseName: appData.courseName,
        institutionName: appData.institutionName,
        status: appData.status || 'pending',
        applicationDate: appData.applicationDate || appData.appliedAt,
        requirementsMet: appData.requirementsMet || true,
        documents: appData.documents || [],
        createdAt: appData.createdAt || appData.appliedAt,
        updatedAt: appData.updatedAt
      });
    });
    
    console.log(`✅ Found ${applications.length} applications for student ${studentId}`);
    
    res.json({
      success: true,
      message: 'Applications retrieved successfully',
      data: applications
    });
    
  } catch (error) {
    console.error('❌ Error fetching student applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// @desc    Apply for course
// @route   POST /api/students/applications
// @access  Private (Student)
const applyForCourse = async (req, res) => {
  try {
    const applicationData = {
      ...req.body,
      studentId: req.user.id, // Use authenticated user's ID
      studentName: req.user.name,
      studentEmail: req.user.email,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      applicationDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('📝 Submitting application:', applicationData);
    
    // Validate required fields
    if (!applicationData.courseId || !applicationData.institutionId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and Institution ID are required'
      });
    }
    
    // Check if student already applied to this course
    const existingAppSnapshot = await db.collection('applications')
      .where('studentId', '==', applicationData.studentId)
      .where('courseId', '==', applicationData.courseId)
      .get();
    
    if (!existingAppSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this course'
      });
    }
    
    // Check application limit (2 courses per institution)
    const institutionAppsSnapshot = await db.collection('applications')
      .where('studentId', '==', applicationData.studentId)
      .where('institutionId', '==', applicationData.institutionId)
      .get();
    
    if (institutionAppsSnapshot.size >= 2) {
      return res.status(400).json({
        success: false,
        message: 'You can only apply to maximum 2 courses per institution'
      });
    }
    
    // Add the application to Firestore
    const docRef = await db.collection('applications').add(applicationData);
    
    console.log('✅ Application submitted successfully with ID:', docRef.id);
    
    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        id: docRef.id,
        ...applicationData
      }
    });
    
  } catch (error) {
    console.error('❌ Error submitting application:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
};

// @desc    Get student dashboard
// @route   GET /api/students/dashboard
// @access  Private (Student)
const getDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    console.log('🎯 Fetching dashboard for student:', studentId);
    
    // Get student applications
    const applicationsSnapshot = await db.collection('applications')
      .where('studentId', '==', studentId)
      .get();
    
    const applications = [];
    applicationsSnapshot.forEach(doc => {
      applications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get job applications
    const jobApplicationsSnapshot = await db.collection('jobApplications')
      .where('studentId', '==', studentId)
      .get();
    
    const jobApplications = [];
    jobApplicationsSnapshot.forEach(doc => {
      jobApplications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Calculate stats
    const stats = {
      totalApplications: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      admitted: applications.filter(app => app.status === 'admitted').length,
      totalJobApplications: jobApplications.length,
      jobPending: jobApplications.filter(app => app.status === 'pending').length,
      jobReviewed: jobApplications.filter(app => app.status === 'reviewed').length,
      jobAccepted: jobApplications.filter(app => app.status === 'accepted').length,
      jobRejected: jobApplications.filter(app => app.status === 'rejected').length
    };
    
    res.json({
      success: true,
      data: {
        student: req.user,
        applications: applications.slice(0, 5), // Recent 5 applications
        jobApplications: jobApplications.slice(0, 5), // Recent 5 job applications
        stats
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching student dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard',
      error: error.message
    });
  }
};

// JOB CONTROLLER METHODS - NEW

// @desc    Get available jobs for students
// @route   GET /api/students/jobs
// @access  Private (Student)
const getAvailableJobs = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    console.log('🔍 Fetching available jobs for student:', studentId);
    
    // Get all open jobs
    const jobsSnapshot = await db.collection('jobs')
      .where('status', '==', 'open')
      .get();
    
    if (jobsSnapshot.empty) {
      return res.json({
        success: true,
        message: 'No job openings available',
        data: []
      });
    }
    
    const jobs = [];
    
    for (const jobDoc of jobsSnapshot.docs) {
      const jobData = jobDoc.data();
      
      // Get company details
      let companyData = {};
      if (jobData.companyId) {
        try {
          const companyDoc = await db.collection('users').doc(jobData.companyId).get();
          if (companyDoc.exists()) {
            companyData = companyDoc.data();
          }
        } catch (error) {
          console.warn('Could not fetch company details:', error);
        }
      }
      
      // Check if student already applied
      const existingApplicationSnapshot = await db.collection('jobApplications')
        .where('studentId', '==', studentId)
        .where('jobId', '==', jobDoc.id)
        .get();
      
      const hasApplied = !existingApplicationSnapshot.empty;
      
      jobs.push({
        id: jobDoc.id,
        ...jobData,
        company: companyData,
        hasApplied: hasApplied
      });
    }
    
    console.log(`✅ Found ${jobs.length} available jobs`);
    
    res.json({
      success: true,
      message: 'Jobs retrieved successfully',
      data: jobs
    });
    
  } catch (error) {
    console.error('❌ Error fetching available jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

// @desc    Apply for a job
// @route   POST /api/students/jobs/apply
// @access  Private (Student)
const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    const studentId = req.user.id;
    
    console.log('📝 Student applying for job:', { studentId, jobId, coverLetter });
    
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }
    
    // Check if job exists and is open
    const jobDoc = await db.collection('jobs').doc(jobId).get();
    if (!jobDoc.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    const jobData = jobDoc.data();
    if (jobData.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications'
      });
    }
    
    // Check if already applied
    const existingApplicationSnapshot = await db.collection('jobApplications')
      .where('studentId', '==', studentId)
      .where('jobId', '==', jobId)
      .get();
    
    if (!existingApplicationSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }
    
    // Create job application
    const jobApplicationData = {
      jobId: jobId,
      studentId: studentId,
      studentName: req.user.name,
      studentEmail: req.user.email,
      coverLetter: coverLetter || '',
      status: 'pending',
      appliedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('jobApplications').add(jobApplicationData);
    
    console.log('✅ Job application submitted with ID:', docRef.id);
    
    res.json({
      success: true,
      message: 'Job application submitted successfully',
      data: {
        id: docRef.id,
        ...jobApplicationData
      }
    });
    
  } catch (error) {
    console.error('❌ Error applying for job:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying for job',
      error: error.message
    });
  }
};

// @desc    Get student's job applications
// @route   GET /api/students/job-applications
// @access  Private (Student)
const getMyJobApplications = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    console.log('📋 Fetching job applications for student:', studentId);
    
    const jobApplicationsSnapshot = await db.collection('jobApplications')
      .where('studentId', '==', studentId)
      .get();
    
    if (jobApplicationsSnapshot.empty) {
      return res.json({
        success: true,
        message: 'No job applications found',
        data: []
      });
    }
    
    const jobApplications = [];
    
    for (const appDoc of jobApplicationsSnapshot.docs) {
      const appData = appDoc.data();
      
      // Get job details
      let jobData = {};
      if (appData.jobId) {
        try {
          const jobDoc = await db.collection('jobs').doc(appData.jobId).get();
          if (jobDoc.exists()) {
            jobData = jobDoc.data();
          }
        } catch (error) {
          console.warn('Could not fetch job details:', error);
        }
      }
      
      // Get company details
      let companyData = {};
      if (jobData.companyId) {
        try {
          const companyDoc = await db.collection('users').doc(jobData.companyId).get();
          if (companyDoc.exists()) {
            companyData = companyDoc.data();
          }
        } catch (error) {
          console.warn('Could not fetch company details:', error);
        }
      }
      
      jobApplications.push({
        id: appDoc.id,
        ...appData,
        job: {
          ...jobData,
          company: companyData
        }
      });
    }
    
    console.log(`✅ Found ${jobApplications.length} job applications`);
    
    res.json({
      success: true,
      message: 'Job applications retrieved successfully',
      data: jobApplications
    });
    
  } catch (error) {
    console.error('❌ Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job applications',
      error: error.message
    });
  }
};

module.exports = {
  getStudentApplications,
  applyForCourse,
  getDashboard,
  getAvailableJobs,
  applyForJob,
  getMyJobApplications
};