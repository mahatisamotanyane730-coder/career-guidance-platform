// src/services/studentService.js
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  doc, 
  getDoc, 
  updateDoc, 
  writeBatch,
} from 'firebase/firestore';

export const studentService = {
  // Get student applications directly from Firestore
  getStudentApplications: async (studentId) => {
    try {
      if (!studentId) {
        console.warn('No studentId provided, returning empty applications');
        return {
          success: true,
          data: [],
          message: 'No student ID provided'
        };
      }
      
      console.log('Fetching applications from Firestore for student:', studentId);
      const q = query(
        collection(db, 'applications'), 
        where('studentId', '==', studentId)
      );
      const applicationsSnapshot = await getDocs(q);
      const applications = applicationsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      console.log('Applications from Firestore:', applications);
      return {
        success: true,
        data: applications
      };
    } catch (error) {
      console.error('Error fetching student applications from Firestore:', error);
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
      console.log('Submitting application to Firestore:', applicationData);
      
      // Check if already applied to the same course at the same institution
      const existingApplicationQuery = query(
        collection(db, 'applications'),
        where('studentId', '==', applicationData.studentId),
        where('courseId', '==', applicationData.courseId),
        where('institutionId', '==', applicationData.institutionId)
      );
      
      const existingApplications = await getDocs(existingApplicationQuery);
      
      if (!existingApplications.empty) {
        return {
          success: false,
          message: 'You have already applied to this course at this institution.'
        };
      }
      
      const completeApplicationData = {
        ...applicationData,
        status: 'pending',
        applicationDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'applications'), completeApplicationData);
      
      console.log('Application submitted to Firestore with ID:', docRef.id);
      
      return {
        success: true,
        message: 'Application submitted successfully',
        data: { id: docRef.id, ...completeApplicationData }
      };
    } catch (error) {
      console.error('Error submitting application to Firestore:', error);
      throw new Error('Failed to submit application: ' + error.message);
    }
  },

  // Get student dashboard data
  getDashboard: async (studentId) => {
    try {
      if (!studentId) {
        console.warn('No studentId provided for dashboard');
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
              admitted: 0,
              totalJobApplications: 0,
              jobPending: 0,
              jobReviewed: 0,
              jobAccepted: 0,
              jobRejected: 0,
              hasTranscript: false
            }
          }
        };
      }
      
      const applications = await studentService.getStudentApplications(studentId);
      const jobApplications = await studentService.getMyJobApplications(studentId);
      const transcript = await studentService.getTranscriptWithStudentId(studentId);
      
      const stats = {
        totalApplications: applications.data.length,
        pending: applications.data.filter(app => app.status === 'pending').length,
        approved: applications.data.filter(app => app.status === 'approved').length,
        rejected: applications.data.filter(app => app.status === 'rejected').length,
        admitted: applications.data.filter(app => app.status === 'admitted').length,
        totalJobApplications: jobApplications.data.length,
        jobPending: jobApplications.data.filter(app => app.status === 'pending').length,
        jobReviewed: jobApplications.data.filter(app => app.status === 'reviewed').length,
        jobAccepted: jobApplications.data.filter(app => app.status === 'accepted').length,
        jobRejected: jobApplications.data.filter(app => app.status === 'rejected').length,
        hasTranscript: !!transcript.data
      };
      
      return {
        success: true,
        data: {
          student: {},
          applications: applications.data.slice(0, 5),
          jobApplications: jobApplications.data.slice(0, 5),
          transcript: transcript.data,
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
          jobApplications: [],
          transcript: null,
          stats: {
            totalApplications: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            admitted: 0,
            totalJobApplications: 0,
            jobPending: 0,
            jobReviewed: 0,
            jobAccepted: 0,
            jobRejected: 0,
            hasTranscript: false
          }
        }
      };
    }
  },

  // JOB APPLICATION METHODS - FIXED VERSION
  getAvailableJobs: async () => {
    try {
      console.log('Fetching available jobs from Firestore');
      
      // FIXED: Simplified query without composite index requirement
      const jobsQuery = query(collection(db, 'jobs'));
      const jobsSnapshot = await getDocs(jobsQuery);
      
      const jobs = [];
      
      for (const jobDoc of jobsSnapshot.docs) {
        const jobData = jobDoc.data();
        
        // Only include jobs that are open (client-side filtering)
        if (jobData.status !== 'open') {
          continue;
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
        
        jobs.push({
          id: jobDoc.id,
          ...jobData,
          company: companyData
        });
      }
      
      // Sort by createdAt date on client side
      jobs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      
      console.log('Available jobs from Firestore:', jobs.length);
      
      return {
        success: true,
        data: jobs
      };
    } catch (error) {
      console.error('Error fetching available jobs:', error);
      return {
        success: false,
        message: 'Error fetching jobs',
        data: []
      };
    }
  },

  applyForJob: async (jobId, applicationData) => {
    try {
      console.log('Applying for job:', jobId, applicationData);
      
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
          message: 'You have already applied for this job position.'
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
      
      console.log('Job application submitted with ID:', docRef.id);
      
      return {
        success: true,
        message: 'Job application submitted successfully',
        data: {
          id: docRef.id,
          ...jobApplicationData
        }
      };
    } catch (error) {
      console.error('Error applying for job:', error);
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
      
      console.log('Fetching job applications for student:', studentId);
      
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
      
      // Sort by applied date
      jobApplications.sort((a, b) => new Date(b.appliedDate || 0) - new Date(a.appliedDate || 0));
      
      console.log('Job applications found:', jobApplications.length);
      
      return {
        success: true,
        data: jobApplications
      };
    } catch (error) {
      console.error('Error fetching job applications:', error);
      return {
        success: false,
        message: 'Error fetching job applications',
        data: []
      };
    }
  },

  // ADD THIS MISSING METHOD TO FIX THE DASHBOARD ERROR
  getStudentJobApplications: async (studentId) => {
    return studentService.getMyJobApplications(studentId);
  },

  // NEW METHODS FOR ADVANCED FEATURES

  // Transcript methods - FIXED VERSION
  uploadTranscript: async (studentId, transcriptData) => {
    try {
      console.log('Uploading transcript to Firestore for student:', studentId, transcriptData);
      
      if (!studentId) {
        throw new Error('Student ID is required to upload transcript');
      }
      
      const completeTranscriptData = {
        ...transcriptData,
        studentId: studentId,
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Check if transcript already exists for this student
      const existingTranscriptQuery = query(
        collection(db, 'transcripts'),
        where('studentId', '==', studentId)
      );
      
      const existingTranscriptSnapshot = await getDocs(existingTranscriptQuery);
      
      let transcriptRef;
      let transcriptId;
      
      if (!existingTranscriptSnapshot.empty) {
        // Update existing transcript
        transcriptRef = existingTranscriptSnapshot.docs[0].ref;
        transcriptId = existingTranscriptSnapshot.docs[0].id;
        await updateDoc(transcriptRef, completeTranscriptData);
        console.log('Transcript updated in Firestore with ID:', transcriptId);
      } else {
        // Create new transcript
        transcriptRef = await addDoc(collection(db, 'transcripts'), completeTranscriptData);
        transcriptId = transcriptRef.id;
        console.log('Transcript uploaded to Firestore with ID:', transcriptId);
      }
      
      return {
        success: true,
        message: 'Transcript uploaded successfully',
        data: {
          id: transcriptId,
          ...completeTranscriptData
        }
      };
    } catch (error) {
      console.error('Error uploading transcript:', error);
      return {
        success: false,
        message: 'Error uploading transcript: ' + error.message
      };
    }
  },

  getAllInstitutions: async () => {
    try {
      console.log('Fetching all institutions from Firestore');
      
      const institutionsSnapshot = await getDocs(collection(db, 'institutions'));
      const institutions = institutionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('All institutions from Firestore:', institutions.length);
      
      return {
        success: true,
        data: institutions
      };
    } catch (error) {
      console.error('Error fetching all institutions:', error);
      return {
        success: false,
        message: 'Error fetching institutions',
        data: []
      };
    }
  },

  // FIXED getTranscript method - removed unreachable code
  getTranscript: async (studentId) => {
    try {
      if (!studentId) {
        return {
          success: true,
          data: null,
          message: 'No student ID provided'
        };
      }
      
      console.log('Fetching transcript for student:', studentId);
      
      const transcriptQuery = query(
        collection(db, 'transcripts'),
        where('studentId', '==', studentId)
      );
      
      const transcriptSnapshot = await getDocs(transcriptQuery);
      
      if (transcriptSnapshot.empty) {
        return {
          success: true,
          data: null,
          message: 'No transcript found'
        };
      }
      
      const transcript = {
        id: transcriptSnapshot.docs[0].id,
        ...transcriptSnapshot.docs[0].data()
      };
      
      console.log('Transcript found:', transcript);
      
      return {
        success: true,
        data: transcript,
        message: 'Transcript retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting transcript:', error);
      return {
        success: false,
        message: 'Error getting transcript',
        data: null
      };
    }
  },

  // ✅ FIXED: Admission acceptance method - NOW ACTUALLY UPDATES FIRESTORE
  acceptAdmission: async (applicationId) => {
    try {
      console.log('Accepting admission for application:', applicationId);
      
      if (!applicationId) {
        throw new Error('Application ID is required');
      }

      // Get the application to be accepted
      const applicationDoc = await getDoc(doc(db, 'applications', applicationId));
      if (!applicationDoc.exists()) {
        throw new Error('Application not found');
      }

      const applicationData = applicationDoc.data();
      const studentId = applicationData.studentId;

      if (!studentId) {
        throw new Error('Student ID not found in application');
      }

      // Get all applications for this student
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('studentId', '==', studentId)
      );
      
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const batch = writeBatch(db);

      console.log(`Found ${applicationsSnapshot.size} applications for student ${studentId}`);

      // Update all applications
      applicationsSnapshot.forEach((appDoc) => {
        const appData = appDoc.data();
        
        if (appDoc.id === applicationId) {
          // Accept this application
          console.log(`Accepting application: ${appDoc.id} for ${appData.courseName}`);
          batch.update(appDoc.ref, {
            status: 'accepted',
            acceptedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } else {
          // Decline all other applications
          console.log(`Declining application: ${appDoc.id} for ${appData.courseName}`);
          batch.update(appDoc.ref, {
            status: 'rejected',
            rejectionReason: 'Student accepted another offer',
            updatedAt: new Date().toISOString()
          });
        }
      });

      // Commit the batch write
      await batch.commit();
      
      console.log('Admission acceptance processed successfully');

      return {
        success: true,
        message: 'Admission accepted successfully! All other offers have been declined.'
      };
    } catch (error) {
      console.error('Error accepting admission:', error);
      return {
        success: false,
        message: 'Error accepting admission: ' + error.message
      };
    }
  },

  // ✅ FIXED: Qualified courses method - SHOWS ALL COURSES WITHOUT TRANSCRIPT
  getQualifiedCourses: async (studentId) => {
    try {
      console.log('Getting qualified courses for student:', studentId);
      
      if (!studentId) {
        return {
          success: true,
          data: {
            qualifiedCourses: [],
            totalCourses: 0,
            transcript: null
          },
          message: 'No student ID provided'
        };
      }
      
      // Get transcript first
      const transcriptResult = await studentService.getTranscript(studentId);
      const transcript = transcriptResult.data;
      
      // Get all courses
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const allCourses = [];
      coursesSnapshot.forEach(doc => {
        allCourses.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('All courses found:', allCourses.length);
      
      // ✅ FIXED: If no transcript, return ALL courses with a message
      if (!transcript) {
        console.log('No transcript found - showing all courses');
        return {
          success: true,
          data: {
            qualifiedCourses: allCourses,
            totalCourses: allCourses.length,
            transcript: null
          },
          message: 'No transcript uploaded yet. Showing all available courses. Upload your transcript to see courses that match your qualifications.'
        };
      }
      
      console.log('Student transcript subjects:', transcript.completedSubjects);
      
      // If transcript exists, filter courses based on subjects
      const qualifiedCourses = allCourses.filter(course => {
        // If course has no requirements, student qualifies
        if (!course.requirements || course.requirements.length === 0) {
          return true;
        }
        
        // If transcript has no subjects, show all courses
        if (!transcript.completedSubjects || transcript.completedSubjects.length === 0) {
          return true;
        }
        
        const requiredSubjects = course.requirements || [];
        const studentSubjects = transcript.completedSubjects || [];
        
        // Convert to lowercase for case-insensitive matching
        const studentSubjectsLower = studentSubjects.map(sub => sub.toLowerCase().trim());
        const requiredSubjectsLower = requiredSubjects.map(req => req.toLowerCase().trim());
        
        // Check if student has ANY of the required subjects
        const hasMatchingSubjects = requiredSubjectsLower.some(requirement => {
          return studentSubjectsLower.some(studentSubject => {
            return studentSubject.includes(requirement) || 
                   requirement.includes(studentSubject) ||
                   studentService.checkSubjectMatch(studentSubject, requirement);
          });
        });
        
        // Check if student has at least 40% of required subjects
        let matchCount = 0;
        requiredSubjectsLower.forEach(requirement => {
          const hasMatch = studentSubjectsLower.some(studentSubject => {
            return studentSubject.includes(requirement) || 
                   requirement.includes(studentSubject) ||
                   studentService.checkSubjectMatch(studentSubject, requirement);
          });
          if (hasMatch) matchCount++;
        });
        
        const hasMinimumSubjects = matchCount >= Math.ceil(requiredSubjectsLower.length * 0.4);
        
        return hasMatchingSubjects && hasMinimumSubjects;
      });
      
      console.log(`Found ${qualifiedCourses.length} qualified courses out of ${allCourses.length} total courses`);
      
      return {
        success: true,
        data: {
          qualifiedCourses,
          totalCourses: allCourses.length,
          transcript: transcript
        },
        message: 'Qualified courses retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting qualified courses:', error);
      return {
        success: false,
        message: 'Error getting qualified courses',
        data: {
          qualifiedCourses: [],
          totalCourses: 0,
          transcript: null
        }
      };
    }
  },

  // Get transcript with student ID (alias for getTranscript)
  getTranscriptWithStudentId: async (studentId) => {
    return studentService.getTranscript(studentId);
  },

  // ADD THIS METHOD - Get all courses for subject-based matching
  getAllCourses: async () => {
    try {
      console.log('Fetching all courses from Firestore');
      
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const courses = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('All courses from Firestore:', courses.length);
      
      return {
        success: true,
        data: courses
      };
    } catch (error) {
      console.error('Error fetching all courses:', error);
      return {
        success: false,
        message: 'Error fetching courses',
        data: []
      };
    }
  },

  // ========== JOB MATCHING METHODS ==========

  // ✅ FIXED: Get jobs that match student's qualifications - BETTER MATCHING LOGIC
  getQualifiedJobs: async (studentId) => {
    try {
      console.log('Finding qualified jobs for student:', studentId);
      
      if (!studentId) {
        return {
          success: true,
          data: {
            qualifiedJobs: [],
            allJobs: [],
            transcript: null
          },
          message: 'No student ID provided'
        };
      }
      
      // Get student's transcript
      const transcriptResult = await studentService.getTranscript(studentId);
      const transcript = transcriptResult.data;
      
      // Get all available jobs
      const jobsResponse = await studentService.getAvailableJobs();
      const allJobs = jobsResponse.data || [];
      
      console.log('All jobs found:', allJobs.length);
      
      // ✅ FIXED: If no transcript, return ALL jobs with a message
      if (!transcript) {
        console.log('No transcript found - showing all jobs');
        return {
          success: true,
          data: {
            qualifiedJobs: allJobs,
            allJobs: allJobs,
            transcript: null
          },
          message: 'No transcript uploaded yet. Showing all available jobs. Upload your transcript to see jobs that match your qualifications.'
        };
      }
      
      console.log('Student subjects:', transcript.completedSubjects);
      console.log('Available jobs count:', allJobs.length);
      
      // If transcript exists, filter jobs based on subjects
      const qualifiedJobs = allJobs.filter(job => {
        // If job has no requirements, always show it
        if (!job.requirements || job.requirements.length === 0) {
          return true;
        }
        
        // If transcript has no subjects, show all jobs
        if (!transcript.completedSubjects || transcript.completedSubjects.length === 0) {
          return true;
        }
        
        // Check if student has ANY of the required skills/subjects
        const hasMatchingSkills = job.requirements.some(requirement => {
          const cleanRequirement = requirement.trim().toLowerCase();
          
          // Check if any subject matches the requirement
          return transcript.completedSubjects.some(subject => {
            const cleanSubject = subject.trim().toLowerCase();
            
            // Enhanced matching logic
            const directMatch = cleanSubject.includes(cleanRequirement) || 
                              cleanRequirement.includes(cleanSubject);
            
            const skillMatch = studentService.checkSkillMatch(subject, requirement);
            
            const subjectMatch = studentService.checkSubjectMatch(subject, requirement);
            
            return directMatch || skillMatch || subjectMatch;
          });
        });
        
        return hasMatchingSkills;
      });
      
      console.log(`Found ${qualifiedJobs.length} qualified jobs out of ${allJobs.length} total jobs`);
      
      return {
        success: true,
        data: {
          qualifiedJobs,
          allJobs,
          transcript: transcript
        },
        message: qualifiedJobs.length > 0 
          ? 'Qualified jobs retrieved successfully' 
          : 'No jobs match your current qualifications. Try viewing all available jobs.'
      };
    } catch (error) {
      console.error('Error getting qualified jobs:', error);
      return {
        success: false,
        message: 'Error getting qualified jobs',
        data: {
          qualifiedJobs: [],
          allJobs: [],
          transcript: null
        }
      };
    }
  },

  // ✅ ENHANCED: Helper method for skill matching
  checkSkillMatch: (studentSkill, jobRequirement) => {
    const skillMap = {
      // Technical skills
      'mathematics': ['data analysis', 'statistics', 'analytics', 'sql', 'python', 'excel', 'calculations', 'numbers'],
      'science': ['research', 'analysis', 'technical', 'laboratory', 'experiments', 'scientific'],
      'computer studies': ['programming', 'software', 'development', 'coding', 'javascript', 'react', 'node.js', 'web', 'app', 'developer'],
      'ict': ['technology', 'it', 'computer', 'software', 'hardware', 'troubleshooting', 'networking', 'systems'],
      'design and technology': ['design', 'creative', 'technical', 'engineering', 'drawing', 'cad'],
      
      // Business skills
      'commerce': ['business', 'marketing', 'sales', 'management', 'coordination', 'administration'],
      'accounting': ['finance', 'budget', 'analysis', 'numbers', 'bookkeeping', 'accounts'],
      'economics': ['analysis', 'market', 'business', 'strategy', 'financial', 'economic'],
      
      // Creative skills
      'art': ['design', 'creative', 'visual', 'graphic', 'adobe', 'photoshop', 'illustrator'],
      'media studies': ['media', 'content', 'communication', 'social media', 'journalism', 'writing'],
      
      // Communication skills
      'english': ['communication', 'writing', 'documentation', 'content', 'editing', 'proofreading'],
      'sesotho': ['local', 'communication', 'customer service', 'translation'],
      'sign language': ['communication', 'accessibility', 'inclusion', 'interpretation'],
      
      // Science skills
      'physics': ['technical', 'engineering', 'analysis', 'problem-solving'],
      'biology': ['life sciences', 'healthcare', 'medical', 'research'],
      'chemistry': ['laboratory', 'research', 'analysis', 'scientific'],
      'physical science': ['technical', 'scientific', 'analysis'],
      
      // General skills
      'life-skills': ['teamwork', 'communication', 'problem-solving', 'customer service', 'interpersonal'],
      'psychology': ['people skills', 'communication', 'analysis', 'behavior'],
      'sociology': ['social', 'research', 'analysis', 'community'],
      'geography': ['environmental', 'research', 'analysis', 'planning'],
      'history': ['research', 'analysis', 'documentation', 'writing'],
      'agriculture': ['farming', 'environmental', 'technical', 'management']
    };
    
    const studentSkillLower = studentSkill.toLowerCase();
    const jobReqLower = jobRequirement.toLowerCase();
    
    // Check direct matches in the skill map
    if (skillMap[studentSkillLower]) {
      return skillMap[studentSkillLower].some(skill => jobReqLower.includes(skill));
    }
    
    // Also check reverse mapping
    for (const [skill, relatedSkills] of Object.entries(skillMap)) {
      if (jobReqLower.includes(skill)) {
        return relatedSkills.some(relatedSkill => studentSkillLower.includes(relatedSkill));
      }
    }
    
    return false;
  },

  // ✅ NEW: Helper method for subject matching in course qualification
  checkSubjectMatch: (studentSubject, requiredSubject) => {
    const subjectMap = {
      // Mathematics variations
      'math': ['mathematics', 'maths', 'calculation', 'numeracy'],
      'mathematics': ['math', 'maths', 'calculation'],
      
      // Science variations
      'science': ['biology', 'chemistry', 'physics', 'scientific'],
      'biology': ['science', 'life science'],
      'chemistry': ['science', 'chemical'],
      'physics': ['science', 'physical science'],
      
      // Language variations
      'english': ['language', 'literature', 'communication'],
      'sesotho': ['language', 'local language'],
      
      // Business variations
      'commerce': ['business', 'economics', 'accounting'],
      'business': ['commerce', 'entrepreneurship', 'management'],
      'accounting': ['finance', 'bookkeeping'],
      'economics': ['business', 'commerce'],
      
      // Technical variations
      'computer': ['ict', 'technology', 'computing', 'it'],
      'ict': ['computer', 'technology', 'information technology'],
      'technology': ['computer', 'ict', 'technical'],
      
      // Creative variations
      'art': ['design', 'creative', 'drawing'],
      'design': ['art', 'creative'],
      
      // General variations
      'life skills': ['life orientation', 'personal development'],
      'geography': ['environmental studies', 'earth science'],
      'history': ['social studies', 'heritage']
    };
    
    const studentLower = studentSubject.toLowerCase();
    const requiredLower = requiredSubject.toLowerCase();
    
    // Check direct mapping
    if (subjectMap[studentLower]) {
      return subjectMap[studentLower].some(related => requiredLower.includes(related));
    }
    
    if (subjectMap[requiredLower]) {
      return subjectMap[requiredLower].some(related => studentLower.includes(related));
    }
    
    return false;
  },

  // ✅ FIXED: Apply for job with university transcript - NO MORE UNDEFINED VALUES
  applyForJobWithTranscript: async (jobId, studentId) => {
    try {
      console.log('Applying for job with transcript:', jobId, studentId);
      
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      
      // Check if already applied - WITH CLEAR MESSAGE
      const existingApplicationsQuery = query(
        collection(db, 'jobApplications'),
        where('studentId', '==', studentId),
        where('jobId', '==', jobId)
      );
      
      const existingApplications = await getDocs(existingApplicationsQuery);
      
      if (!existingApplications.empty) {
        return {
          success: false,
          message: '⚠️ You have already applied for this job position.'
        };
      }
      
      // Get student transcript for the application
      const transcriptResult = await studentService.getTranscript(studentId);
      const transcript = transcriptResult.data || {};
      
      // Get job details
      const jobDoc = await getDoc(doc(db, 'jobs', jobId));
      if (!jobDoc.exists()) {
        throw new Error('Job not found');
      }
      const jobData = jobDoc.data();
      
      // ✅ FIXED: Create job application with PROPER DEFAULT VALUES
      const jobApplicationData = {
        jobId: jobId || '',
        studentId: studentId || '',
        jobTitle: jobData.title || jobData.jobTitle || 'Unknown Position',
        companyId: jobData.companyId || '',
        companyName: jobData.company?.companyName || jobData.companyName || 'Unknown Company',
        status: 'pending',
        appliedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        transcriptData: {
          university: transcript?.university || transcript?.highSchool || 'Not specified',
          yearCompleted: transcript?.yearCompleted || 'Not specified',
          completedSubjects: transcript?.completedSubjects || [],
          degree: transcript?.degree || transcript?.program || 'Not specified',
          gpa: transcript?.gpa || transcript?.cgpa || 0
        },
        matchScore: studentService.calculateJobMatchScore(jobData, transcript)
      };
      
      // ✅ FIXED: Remove any undefined values before saving
      const cleanApplicationData = JSON.parse(JSON.stringify(jobApplicationData));
      
      const docRef = await addDoc(collection(db, 'jobApplications'), cleanApplicationData);
      
      console.log('Job application submitted with ID:', docRef.id);
      
      return {
        success: true,
        message: '✅ Job application submitted successfully!',
        data: {
          id: docRef.id,
          ...cleanApplicationData
        }
      };
    } catch (error) {
      console.error('Error applying for job:', error);
      return {
        success: false,
        message: '❌ Error applying for job: ' + error.message
      };
    }
  },

  // Apply for job with CV content
  applyForJobWithCV: async (jobId, studentId, cvContent = '') => {
    try {
      console.log('Applying for job with CV:', jobId, studentId);
      
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      
      // Check if already applied - WITH CLEAR MESSAGE
      const existingApplicationsQuery = query(
        collection(db, 'jobApplications'),
        where('studentId', '==', studentId),
        where('jobId', '==', jobId)
      );
      
      const existingApplications = await getDocs(existingApplicationsQuery);
      
      if (!existingApplications.empty) {
        return {
          success: false,
          message: '⚠️ You have already applied for this job position.'
        };
      }
      
      // Get student transcript for the application
      const transcriptResult = await studentService.getTranscript(studentId);
      const transcript = transcriptResult.data || {};
      
      // Get job details
      const jobDoc = await getDoc(doc(db, 'jobs', jobId));
      if (!jobDoc.exists()) {
        throw new Error('Job not found');
      }
      const jobData = jobDoc.data();
      
      // Create job application with CV data
      const jobApplicationData = {
        jobId: jobId || '',
        studentId: studentId || '',
        jobTitle: jobData.title || jobData.jobTitle || 'Unknown Position',
        companyId: jobData.companyId || '',
        companyName: jobData.company?.companyName || jobData.companyName || 'Unknown Company',
        status: 'pending',
        appliedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cvContent: cvContent || 'Auto-generated professional CV',
        transcriptData: {
          university: transcript?.university || transcript?.highSchool || 'Not specified',
          yearCompleted: transcript?.yearCompleted || 'Not specified',
          completedSubjects: transcript?.completedSubjects || [],
          degree: transcript?.degree || transcript?.program || 'Not specified',
          gpa: transcript?.gpa || transcript?.cgpa || 0
        },
        matchScore: studentService.calculateJobMatchScore(jobData, transcript)
      };
    
      // Remove any undefined values
      const cleanApplicationData = JSON.parse(JSON.stringify(jobApplicationData));
      
      const docRef = await addDoc(collection(db, 'jobApplications'), cleanApplicationData);
      
      console.log('Job application with CV submitted with ID:', docRef.id);
      
      return {
        success: true,
        message: '✅ Job application submitted successfully!',
        data: {
          id: docRef.id,
          ...cleanApplicationData
        }
      };
    } catch (error) {
      console.error('Error applying for job with CV:', error);
      return {
        success: false,
        message: '❌ Error applying for job: ' + error.message
      };
    }
  },

  // Calculate match score between job and student
  calculateJobMatchScore: (job, transcript) => {
    if (!job.requirements || !transcript?.completedSubjects) {
      return 0;
    }
    
    const jobRequirements = job.requirements.map(req => req.trim().toLowerCase());
    const studentSubjects = transcript.completedSubjects.map(sub => sub.trim().toLowerCase());
    
    let matchCount = 0;
    
    jobRequirements.forEach(requirement => {
      const hasMatch = studentSubjects.some(subject => {
        return subject.includes(requirement) || requirement.includes(subject) ||
               studentService.checkSkillMatch(subject, requirement);
      });
      
      if (hasMatch) {
        matchCount++;
      }
    });
    
    const matchScore = (matchCount / jobRequirements.length) * 100;
    return Math.round(matchScore);
  },

  // Get student profile data for CV building
  getStudentProfile: async (studentId) => {
    try {
      if (!studentId) {
        return {
          success: false,
          message: 'Student ID is required',
          data: null
        };
      }

      // Get user data
      const userDoc = await getDoc(doc(db, 'users', studentId));
      if (!userDoc.exists()) {
        return {
          success: false,
          message: 'Student profile not found',
          data: null
        };
      }

      const userData = userDoc.data();

      // Get applications for education history
      const applicationsResponse = await studentService.getStudentApplications(studentId);
      const applications = applicationsResponse.data || [];

      // Get transcript for skills
      const transcriptResponse = await studentService.getTranscript(studentId);
      const transcript = transcriptResponse.data || null;

      // Get job applications for experience
      const jobApplicationsResponse = await studentService.getMyJobApplications(studentId);
      const jobApplications = jobApplicationsResponse.data || [];

      const profileData = {
        personalInfo: {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || 'Not specified'
        },
        education: applications.map(app => ({
          institution: app.institutionName || 'Educational Institution',
          course: app.courseName || 'Course of Study',
          status: app.status || 'Completed',
          year: app.applicationDate ? new Date(app.applicationDate).getFullYear() : 'Current',
          type: 'Academic'
        })),
        skills: transcript?.completedSubjects?.map(subject => subject.split(' ')[0]) || [],
        experience: jobApplications.map(jobApp => ({
          role: `Applied for ${jobApp.job?.title || 'Position'}`,
          company: jobApp.job?.company?.companyName || 'Company',
          duration: jobApp.appliedDate ? new Date(jobApp.appliedDate).getFullYear() : 'Recent',
          description: `Application for ${jobApp.job?.title || 'position'} at ${jobApp.job?.company?.companyName || 'company'}`
        })),
        achievements: transcript ? 
          `Completed ${transcript.completedSubjects?.length || 0} university subjects with focus on ${transcript.completedSubjects?.slice(0, 3).join(', ') || 'academic excellence'}.` 
          : 'Strong academic background with commitment to professional development.'
      };

      return {
        success: true,
        data: profileData,
        message: 'Student profile loaded successfully'
      };
    } catch (error) {
      console.error('Error getting student profile:', error);
      return {
        success: false,
        message: 'Error loading student profile',
        data: null
      };
    }
  },

  // Check if student has already applied to a job
  checkJobApplication: async (studentId, jobId) => {
    try {
      if (!studentId || !jobId) {
        return {
          success: false,
          applied: false,
          message: 'Student ID and Job ID are required'
        };
      }

      const existingApplicationsQuery = query(
        collection(db, 'jobApplications'),
        where('studentId', '==', studentId),
        where('jobId', '==', jobId)
      );
      
      const existingApplications = await getDocs(existingApplicationsQuery);
      
      const hasApplied = !existingApplications.empty;
      
      return {
        success: true,
        applied: hasApplied,
        message: hasApplied ? 'Already applied to this job' : 'Not applied to this job'
      };
    } catch (error) {
      console.error('Error checking job application:', error);
      return {
        success: false,
        applied: false,
        message: 'Error checking application status'
      };
    }
  }
};