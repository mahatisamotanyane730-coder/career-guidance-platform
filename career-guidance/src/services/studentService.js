// src/services/studentService.js
import { db } from './firebase';
import { collection, getDocs, addDoc, query, where, doc, getDoc } from 'firebase/firestore';

export const studentService = {
  // Get student applications directly from Firestore
  getStudentApplications: async (studentId) => {
    try {
      if (!studentId) {
        console.warn('⚠️ No studentId provided, returning empty applications');
        return {
          success: true,
          data: [],
          message: 'No student ID provided'
        };
      }
      
      console.log('📋 Fetching applications from Firestore for student:', studentId);
      const q = query(collection(db, 'applications'), where('studentId', '==', studentId));
      const applicationsSnapshot = await getDocs(q);
      const applications = applicationsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      console.log('✅ Applications from Firestore:', applications);
      return {
        success: true,
        data: applications
      };
    } catch (error) {
      console.error('❌ Error fetching student applications from Firestore:', error);
      return {
        success: true,
        data: [],
        message: 'No applications found'
      };
    }
  },

  // Submit application directly to Firestore
  submitApplication: async (applicationData) => {
    try {
      console.log('📝 Submitting application to Firestore:', applicationData);
      
      const completeApplicationData = {
        ...applicationData,
        status: 'pending',
        applicationDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'applications'), completeApplicationData);
      
      console.log('✅ Application submitted to Firestore with ID:', docRef.id);
      
      return {
        success: true,
        message: 'Application submitted successfully',
        data: { id: docRef.id, ...completeApplicationData }
      };
    } catch (error) {
      console.error('❌ Error submitting application to Firestore:', error);
      throw new Error('Failed to submit application: ' + error.message);
    }
  },

  // Get student dashboard data
  getDashboard: async (studentId) => {
    try {
      if (!studentId) {
        console.warn('⚠️ No studentId provided for dashboard');
        return {
          success: true,
          data: {
            student: {},
            applications: [],
            stats: {
              totalApplications: 0,
              pending: 0,
              approved: 0,
              rejected: 0,
              admitted: 0
            }
          }
        };
      }
      
      const applications = await studentService.getStudentApplications(studentId);
      
      const stats = {
        totalApplications: applications.data.length,
        pending: applications.data.filter(app => app.status === 'pending').length,
        approved: applications.data.filter(app => app.status === 'approved').length,
        rejected: applications.data.filter(app => app.status === 'rejected').length,
        admitted: applications.data.filter(app => app.status === 'admitted').length
      };
      
      return {
        success: true,
        data: {
          student: {},
          applications: applications.data,
          stats: stats
        }
      };
    } catch (error) {
      console.error('Error fetching student dashboard:', error);
      return {
        success: true,
        data: {
          student: {},
          applications: [],
          stats: {
            totalApplications: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            admitted: 0
          }
        }
      };
    }
  },

  // JOB APPLICATION METHODS - NEW
  getAvailableJobs: async () => {
    try {
      console.log('🔍 Fetching available jobs from Firestore');
      
      // Get all jobs with status 'open'
      const jobsQuery = query(
        collection(db, 'jobs'), 
        where('status', '==', 'open')
      );
      const jobsSnapshot = await getDocs(jobsQuery);
      
      const jobs = [];
      
      for (const jobDoc of jobsSnapshot.docs) {
        const jobData = jobDoc.data();
        
        // Get company details
        let companyData = {};
        if (jobData.companyId) {
          try {
            const companyDoc = await getDoc(doc(db, 'users', jobData.companyId));
            if (companyDoc.exists()) {
              companyData = companyDoc.data();
            }
          } catch (error) {
            console.warn('Could not fetch company details:', error);
          }
        }
        
        jobs.push({
          id: jobDoc.id,
          ...jobData,
          company: companyData
        });
      }
      
      console.log('✅ Available jobs from Firestore:', jobs);
      
      return {
        success: true,
        data: jobs
      };
    } catch (error) {
      console.error('❌ Error fetching available jobs:', error);
      return {
        success: false,
        message: 'Error fetching jobs',
        data: []
      };
    }
  },

  applyForJob: async (jobId, applicationData) => {
    try {
      console.log('📝 Applying for job:', jobId, applicationData);
      
      const studentId = applicationData.studentId;
      
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      
      // Check if already applied
      const existingApplicationsQuery = query(
        collection(db, 'jobApplications'),
        where('studentId', '==', studentId),
        where('jobId', '==', jobId)
      );
      
      const existingApplications = await getDocs(existingApplicationsQuery);
      
      if (!existingApplications.empty) {
        return {
          success: false,
          message: 'You have already applied for this job'
        };
      }
      
      // Create job application
      const jobApplicationData = {
        jobId: jobId,
        studentId: studentId,
        coverLetter: applicationData.coverLetter || '',
        status: 'pending',
        appliedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'jobApplications'), jobApplicationData);
      
      console.log('✅ Job application submitted with ID:', docRef.id);
      
      return {
        success: true,
        message: 'Job application submitted successfully',
        data: {
          id: docRef.id,
          ...jobApplicationData
        }
      };
    } catch (error) {
      console.error('❌ Error applying for job:', error);
      return {
        success: false,
        message: 'Error applying for job: ' + error.message
      };
    }
  },

  getMyJobApplications: async (studentId) => {
    try {
      if (!studentId) {
        return {
          success: true,
          data: []
        };
      }
      
      console.log('📋 Fetching job applications for student:', studentId);
      
      const jobApplicationsQuery = query(
        collection(db, 'jobApplications'),
        where('studentId', '==', studentId)
      );
      
      const jobApplicationsSnapshot = await getDocs(jobApplicationsQuery);
      const jobApplications = [];
      
      for (const appDoc of jobApplicationsSnapshot.docs) {
        const appData = appDoc.data();
        
        // Get job details
        let jobData = {};
        if (appData.jobId) {
          try {
            const jobDoc = await getDoc(doc(db, 'jobs', appData.jobId));
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
            const companyDoc = await getDoc(doc(db, 'users', jobData.companyId));
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
      
      console.log('✅ Job applications found:', jobApplications);
      
      return {
        success: true,
        data: jobApplications
      };
    } catch (error) {
      console.error('❌ Error fetching job applications:', error);
      return {
        success: false,
        message: 'Error fetching job applications',
        data: []
      };
    }
  },

  // ✅ ADD THIS MISSING METHOD TO FIX THE DASHBOARD ERROR
  getStudentJobApplications: async (studentId) => {
    return studentService.getMyJobApplications(studentId);
  }
};