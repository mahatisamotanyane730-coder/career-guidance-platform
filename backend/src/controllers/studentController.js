// backend/src/controllers/studentController.js
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
      studentId: req.user.id,
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
    
    // Get student transcript
    const transcriptSnapshot = await db.collection('transcripts')
      .where('studentId', '==', studentId)
      .get();
    
    let transcript = null;
    if (!transcriptSnapshot.empty) {
      transcript = transcriptSnapshot.docs[0].data();
    }
    
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
      jobRejected: jobApplications.filter(app => app.status === 'rejected').length,
      hasTranscript: !!transcript
    };
    
    res.json({
      success: true,
      data: {
        student: req.user,
        applications: applications.slice(0, 5),
        jobApplications: jobApplications.slice(0, 5),
        transcript: transcript,
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

// @desc    Upload student transcript
// @route   POST /api/students/transcript
// @access  Private (Student)
const uploadTranscript = async (req, res) => {
  try {
    const studentId = req.user.id;
    const transcriptData = {
      ...req.body,
      studentId: studentId,
      studentName: req.user.name,
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('📚 Uploading transcript for student:', studentId);
    
    // Check if transcript already exists
    const existingTranscriptSnapshot = await db.collection('transcripts')
      .where('studentId', '==', studentId)
      .get();
    
    let transcriptRef;
    
    if (!existingTranscriptSnapshot.empty) {
      // Update existing transcript
      transcriptRef = existingTranscriptSnapshot.docs[0].ref;
      await transcriptRef.update(transcriptData);
      console.log('✅ Transcript updated successfully');
    } else {
      // Create new transcript
      transcriptRef = await db.collection('transcripts').add(transcriptData);
      console.log('✅ Transcript uploaded successfully with ID:', transcriptRef.id);
    }
    
    res.json({
      success: true,
      message: 'Transcript uploaded successfully',
      data: {
        id: transcriptRef.id,
        ...transcriptData
      }
    });
    
  } catch (error) {
    console.error('❌ Error uploading transcript:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading transcript',
      error: error.message
    });
  }
};

// @desc    Get student transcript
// @route   GET /api/students/transcript
// @access  Private (Student)
const getTranscript = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    console.log('📖 Fetching transcript for student:', studentId);
    
    const transcriptSnapshot = await db.collection('transcripts')
      .where('studentId', '==', studentId)
      .get();
    
    if (transcriptSnapshot.empty) {
      return res.json({
        success: true,
        message: 'No transcript found',
        data: null
      });
    }
    
    const transcript = transcriptSnapshot.docs[0].data();
    
    res.json({
      success: true,
      message: 'Transcript retrieved successfully',
      data: transcript
    });
    
  } catch (error) {
    console.error('❌ Error fetching transcript:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transcript',
      error: error.message
    });
  }
};

// @desc    Accept admission offer
// @route   POST /api/students/admission/accept
// @access  Private (Student)
const acceptAdmission = async (req, res) => {
  try {
    const { applicationId } = req.body;
    const studentId = req.user.id;

    console.log('🎓 Student accepting admission:', { applicationId, studentId });

    // Get the accepted application
    const acceptedAppRef = db.collection('applications').doc(applicationId);
    const acceptedAppDoc = await acceptedAppRef.get();
    
    if (!acceptedAppDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const acceptedApp = acceptedAppDoc.data();
    
    // Verify this application belongs to the student and is admitted
    if (acceptedApp.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this admission'
      });
    }

    if (acceptedApp.status !== 'admitted') {
      return res.status(400).json({
        success: false,
        message: 'This application is not in admitted status'
      });
    }

    // Get all other admitted applications for this student
    const otherAppsSnapshot = await db.collection('applications')
      .where('studentId', '==', studentId)
      .where('status', '==', 'admitted')
      .get();

    const batch = db.batch();

    // Update accepted application to 'accepted'
    batch.update(acceptedAppRef, {
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Reject all other admitted applications
    otherAppsSnapshot.forEach(doc => {
      if (doc.id !== applicationId) {
        batch.update(doc.ref, {
          status: 'rejected',
          rejectionReason: 'Student accepted another offer',
          updatedAt: new Date().toISOString()
        });
      }
    });

    await batch.commit();

    console.log('✅ Admission acceptance processed successfully');

    // Get waitlisted students for the rejected courses and promote them
    await promoteWaitlistedStudents(otherAppsSnapshot);

    res.json({
      success: true,
      message: 'Admission accepted successfully. Other offers have been declined.'
    });

  } catch (error) {
    console.error('❌ Error accepting admission:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting admission',
      error: error.message
    });
  }
};

// Helper function to promote waitlisted students
const promoteWaitlistedStudents = async (admittedApplicationsSnapshot) => {
  try {
    const batch = db.batch();
    
    for (const doc of admittedApplicationsSnapshot.docs) {
      const admittedApp = doc.data();
      
      if (admittedApp.status === 'admitted') {
        // Get the first waitlisted student for this course
        const waitlistedSnapshot = await db.collection('applications')
          .where('courseId', '==', admittedApp.courseId)
          .where('status', '==', 'pending')
          .orderBy('applicationDate', 'asc')
          .limit(1)
          .get();

        if (!waitlistedSnapshot.empty) {
          const nextStudent = waitlistedSnapshot.docs[0];
          batch.update(nextStudent.ref, {
            status: 'admitted',
            admittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          console.log(`✅ Promoted waitlisted student to admitted for course: ${admittedApp.courseName}`);
        }
      }
    }
    
    if (batch._ops.length > 0) {
      await batch.commit();
    }
  } catch (error) {
    console.error('Error promoting waitlisted students:', error);
  }
};

// @desc    Get qualified courses based on transcript
// @route   GET /api/students/qualified-courses
// @access  Private (Student)
const getQualifiedCourses = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    console.log('🎯 Getting qualified courses for student:', studentId);
    
    // Get student transcript
    const transcriptSnapshot = await db.collection('transcripts')
      .where('studentId', '==', studentId)
      .get();
    
    if (transcriptSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'No transcript found. Please upload your transcript first.'
      });
    }
    
    const transcript = transcriptSnapshot.docs[0].data();
    
    // Get all courses
    const coursesSnapshot = await db.collection('courses').get();
    const allCourses = [];
    coursesSnapshot.forEach(doc => {
      allCourses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Filter qualified courses
    const qualifiedCourses = allCourses.filter(course => 
      checkCourseQualification(course, transcript)
    );
    
    console.log(`✅ Found ${qualifiedCourses.length} qualified courses out of ${allCourses.length} total courses`);
    
    res.json({
      success: true,
      message: 'Qualified courses retrieved successfully',
      data: {
        qualifiedCourses,
        totalCourses: allCourses.length,
        transcript: transcript
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting qualified courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting qualified courses',
      error: error.message
    });
  }
};

// Helper function to check course qualification
const checkCourseQualification = (course, transcript) => {
  if (!course.requirements || !transcript.grades) return true;
  
  const requiredSubjects = course.requirements;
  const studentGrades = transcript.grades;
  
  // Check if student has all required subjects
  const hasAllSubjects = requiredSubjects.every(subject => 
    Object.keys(studentGrades).includes(subject)
  );
  
  if (!hasAllSubjects) return false;
  
  // Simple grading system
  const gradePoints = {
    'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0
  };
  
  // Calculate average grade for required subjects
  let totalPoints = 0;
  requiredSubjects.forEach(subject => {
    totalPoints += gradePoints[studentGrades[subject]] || 0;
  });
  
  const averageGrade = totalPoints / requiredSubjects.length;
  
  // Qualify if average grade is C or above
  return averageGrade >= 3;
};

// JOB CONTROLLER METHODS

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
    if (!jobDoc.exists) {
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
  uploadTranscript,
  getTranscript,
  acceptAdmission,
  getQualifiedCourses,
  getAvailableJobs,
  applyForJob,
  getMyJobApplications
};