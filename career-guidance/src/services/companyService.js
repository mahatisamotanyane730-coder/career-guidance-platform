import { api } from './api';
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc,
  updateDoc // ADD this import
} from 'firebase/firestore';

export const companyService = {
  getDashboard: async () => {
    try {
      const response = await api.get('/company/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching company dashboard:', error);
      // Return data from Firestore directly
      try {
        // Get current company user (you'll need to pass companyId)
        const companyId = 'f2v1ajeAy5xWgVHDFzmb'; // Your company ID from the jobs
        
        // Get company's jobs
        const jobsQuery = query(collection(db, 'jobs'), where('companyId', '==', companyId));
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobs = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Get applications for company's jobs
        const applications = [];
        for (const job of jobs) {
          const applicationsQuery = query(
            collection(db, 'jobApplications'), 
            where('jobId', '==', job.id)
          );
          const applicationsSnapshot = await getDocs(applicationsQuery);
          
          for (const appDoc of applicationsSnapshot.docs) {
            const appData = appDoc.data();
            
            // Get student details
            let studentData = {};
            try {
              const studentDoc = await getDoc(doc(db, 'users', appData.studentId));
              if (studentDoc.exists()) {
                studentData = studentDoc.data();
              }
            } catch (error) {
              console.warn('Could not fetch student details:', error);
            }
            
            applications.push({
              id: appDoc.id,
              ...appData,
              studentName: studentData.firstName || studentData.name || 'Student',
              studentEmail: studentData.email || 'No email',
              jobTitle: job.title,
              job: job
            });
          }
        }

        // Calculate stats
        const stats = {
          totalJobs: jobs.length,
          totalApplications: applications.length,
          openJobs: jobs.filter(job => job.status === 'open').length,
          closedJobs: jobs.filter(job => job.status === 'closed').length,
          pendingApplications: applications.filter(app => app.status === 'pending').length
        };

        return {
          success: true,
          data: {
            company: { companyName: 'Tech Solutions' }, // Default company name
            jobs: jobs,
            applications: applications,
            stats: stats
          }
        };
      } catch (firestoreError) {
        console.error('Error fetching from Firestore:', firestoreError);
        return {
          success: true,
          data: {
            company: {},
            jobs: [],
            applications: [],
            stats: {
              totalJobs: 0,
              totalApplications: 0,
              openJobs: 0,
              closedJobs: 0,
              pendingApplications: 0
            }
          }
        };
      }
    }
  },

  getJobs: async () => {
    try {
      const response = await api.get('/company/jobs');
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Fetch from Firestore directly
      try {
        const companyId = 'f2v1ajeAy5xWgVHDFzmb';
        const jobsQuery = query(collection(db, 'jobs'), where('companyId', '==', companyId));
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobs = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        return { success: true, data: jobs };
      } catch (firestoreError) {
        console.error('Error fetching jobs from Firestore:', firestoreError);
        return { success: true, data: [] };
      }
    }
  },

  getJobApplicants: async (jobId) => {
    try {
      const response = await api.get(`/company/jobs/${jobId}/applicants`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job applicants:', error);
      // Fetch from Firestore directly
      try {
        const applicationsQuery = query(
          collection(db, 'jobApplications'), 
          where('jobId', '==', jobId)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applications = [];
        
        for (const appDoc of applicationsSnapshot.docs) {
          const appData = appDoc.data();
          
          // Get student details
          let studentData = {};
          try {
            const studentDoc = await getDoc(doc(db, 'users', appData.studentId));
            if (studentDoc.exists()) {
              studentData = studentDoc.data();
            }
          } catch (error) {
            console.warn('Could not fetch student details:', error);
          }
          
          // Get job details
          let jobData = {};
          try {
            const jobDoc = await getDoc(doc(db, 'jobs', appData.jobId));
            if (jobDoc.exists()) {
              jobData = jobDoc.data();
            }
          } catch (error) {
            console.warn('Could not fetch job details:', error);
          }
          
          applications.push({
            id: appDoc.id,
            ...appData,
            studentName: studentData.firstName || studentData.name || 'Student',
            studentEmail: studentData.email || 'No email',
            phone: studentData.phone || 'Not provided',
            location: studentData.location || 'Not specified',
            jobTitle: jobData.title,
            job: jobData
          });
        }
        
        return { success: true, data: applications };
      } catch (firestoreError) {
        console.error('Error fetching applicants from Firestore:', firestoreError);
        return { success: true, data: [] };
      }
    }
  },

  // UPDATE APPLICATION STATUS METHOD
  updateApplicationStatus: async (applicationId, status) => {
    try {
      const response = await api.patch(`/company/applications/${applicationId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating application status:', error);
      // Update in Firestore directly
      try {
        const applicationRef = doc(db, 'jobApplications', applicationId);
        await updateDoc(applicationRef, {
          status: status,
          updatedAt: new Date().toISOString()
        });
        return { 
          success: true, 
          message: `Application ${status} successfully!`,
          data: { status }
        };
      } catch (firestoreError) {
        console.error('Error updating application in Firestore:', firestoreError);
        return { success: false, message: 'Error updating application status' };
      }
    }
  },

  createJob: async (jobData) => {
    try {
      const response = await api.post('/company/jobs', jobData);
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      return { success: false, message: 'Error creating job' };
    }
  },

  updateJobStatus: async (jobId, status) => {
    try {
      const response = await api.patch(`/company/jobs/${jobId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating job status:', error);
      return { success: false, message: 'Error updating job status' };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/company/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Error updating profile' };
    }
  }
};