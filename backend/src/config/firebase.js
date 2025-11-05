const admin = require('firebase-admin');

// For development - using environment variables or mock data
let db, auth;

try {
  // Check if all required environment variables are present
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
    };

    console.log('🔧 Initializing Firebase with project:', process.env.FIREBASE_PROJECT_ID);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    });
    
    db = admin.firestore();
    auth = admin.auth();
    console.log('✅ Firebase Admin initialized successfully');
    
    // Test the connection
    testFirebaseConnection();
  } else {
    throw new Error('Firebase credentials not found in environment variables');
  }
} catch (error) {
  console.log('⚠️ Firebase Admin initialization skipped - using mock database');
  console.log('💡 Error:', error.message);
  
  // Mock database for development
  const mockDB = {
    users: [
      {
        id: 'dev-user-001',
        email: 'test@test.com',
        password: 'test123',
        name: 'Development Test User',
        role: 'student',
        status: 'active',
        profileCompleted: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'admin-user-001',
        email: 'admin@careerguide.ls',
        password: 'admin123',
        name: 'System Administrator',
        role: 'admin',
        status: 'active',
        profileCompleted: true,
        createdAt: new Date().toISOString()
      }
    ],
    institutions: [
      {
        id: 'inst-001',
        name: 'National University of Lesotho',
        email: 'admissions@nul.ls',
        description: 'Premier higher education institution in Lesotho',
        location: 'Roma, Lesotho',
        contactInfo: {
          phone: '+266 22340601',
          address: 'P.O. Roma 180, Lesotho'
        },
        status: 'active',
        adminId: 'admin-user-001'
      }
    ],
    courses: [
      {
        id: 'course-001',
        name: 'Computer Science',
        institutionId: 'inst-001',
        description: 'Bachelor of Science in Computer Science',
        requirements: ['Mathematics', 'Physics', 'English'],
        duration: '4 years',
        fees: 25000,
        seatsAvailable: 50,
        status: 'open',
        createdAt: new Date().toISOString()
      }
    ],
    applications: [],
    jobs: [],
    transcripts: [],
    notifications: []
  };

  // Mock Firestore-like interface
  db = {
    collection: (name) => ({
      doc: (id) => ({
        get: () => Promise.resolve({
          exists: mockDB[name]?.some(item => item.id === id) || false,
          data: () => mockDB[name]?.find(item => item.id === id) || null
        }),
        set: (data) => {
          if (!mockDB[name]) mockDB[name] = [];
          const index = mockDB[name].findIndex(item => item.id === id);
          if (index >= 0) {
            mockDB[name][index] = { id, ...data };
          } else {
            mockDB[name].push({ id, ...data });
          }
          console.log(`📝 Mock DB: Saved to ${name} collection:`, data);
          return Promise.resolve();
        },
        update: (data) => {
          const index = mockDB[name].findIndex(item => item.id === id);
          if (index >= 0) {
            mockDB[name][index] = { ...mockDB[name][index], ...data };
            console.log(`📝 Mock DB: Updated ${name}/${id}:`, data);
          }
          return Promise.resolve();
        },
        delete: () => {
          mockDB[name] = mockDB[name].filter(item => item.id !== id);
          console.log(`📝 Mock DB: Deleted ${name}/${id}`);
          return Promise.resolve();
        }
      }),
      add: (data) => {
        if (!mockDB[name]) mockDB[name] = [];
        const id = `mock-${name}-${Date.now()}`;
        const newItem = { id, ...data };
        mockDB[name].push(newItem);
        console.log(`📝 Mock DB: Added to ${name} collection:`, newItem);
        return Promise.resolve({ id });
      },
      get: () => {
        console.log(`📝 Mock DB: Reading from ${name} collection`);
        return Promise.resolve({
          empty: !mockDB[name] || mockDB[name].length === 0,
          docs: (mockDB[name] || []).map(item => ({
            id: item.id,
            exists: true,
            data: () => item
          }))
        });
      },
      where: (field, operator, value) => ({
        get: () => {
          const filtered = (mockDB[name] || []).filter(item => {
            switch (operator) {
              case '==': return item[field] === value;
              case '>': return item[field] > value;
              case '<': return item[field] < value;
              case 'array-contains': return item[field]?.includes(value);
              default: return true;
            }
          });
          console.log(`📝 Mock DB: Query ${name} where ${field} ${operator} ${value}`);
          return Promise.resolve({
            empty: filtered.length === 0,
            docs: filtered.map(item => ({
              id: item.id,
              exists: true,
              data: () => item
            }))
          });
        },
        limit: (limitCount) => ({
          get: () => {
            const filtered = (mockDB[name] || []).filter(item => true).slice(0, limitCount);
            return Promise.resolve({
              empty: filtered.length === 0,
              docs: filtered.map(item => ({
                id: item.id,
                exists: true,
                data: () => item
              }))
            });
          }
        })
      })
    })
  };

  auth = {
    createUser: () => Promise.resolve({ uid: `mock-user-${Date.now()}` }),
    verifyIdToken: () => Promise.resolve({ uid: 'mock-user-id' })
  };
}

// Test Firebase connection
async function testFirebaseConnection() {
  try {
    console.log('🧪 Testing Firebase connection...');
    const testDoc = db.collection('test').doc('connection');
    await testDoc.set({ 
      test: true, 
      timestamp: new Date().toISOString() 
    });
    await testDoc.delete();
    console.log('✅ Firebase connection test passed!');
  } catch (error) {
    console.log('❌ Firebase connection test failed:', error.message);
  }
}

// Firestore collections constants
const collections = {
  USERS: 'users',
  INSTITUTIONS: 'institutions',
  FACULTIES: 'faculties',
  COURSES: 'courses',
  APPLICATIONS: 'applications',
  JOBS: 'jobs',
  TRANSCRIPTS: 'transcripts',
  NOTIFICATIONS: 'notifications'
};

// Firestore helper functions
const firestoreHelper = {
  // User operations
  async getUserById(userId) {
    try {
      console.log('🔍 Getting user by ID:', userId);
      const userDoc = await db.collection(collections.USERS).doc(userId).get();
      return userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  },

  async getUserByEmail(email) {
    try {
      console.log('🔍 Getting user by email:', email);
      const usersSnapshot = await db.collection(collections.USERS)
        .where('email', '==', email.toLowerCase().trim())
        .limit(1)
        .get();
      
      if (usersSnapshot.empty) {
        console.log('❌ No user found with email:', email);
        return null;
      }
      
      const userDoc = usersSnapshot.docs[0];
      const userData = { id: userDoc.id, ...userDoc.data() };
      console.log('✅ User found:', userData.email);
      return userData;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  },

  async createUser(userData) {
    try {
      console.log('💾 Creating user in Firestore:', userData.email);
      
      // Create a new document with auto-generated ID
      const userRef = db.collection(collections.USERS).doc();
      const userId = userRef.id;
      
      const userWithId = {
        ...userData,
        id: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        profileCompleted: false
      };
      
      await userRef.set(userWithId);
      
      console.log('✅ User created successfully with ID:', userId);
      
      return {
        id: userId,
        ...userData
      };
    } catch (error) {
      console.error('❌ Error creating user in Firestore:', error);
      throw error;
    }
  },

  async updateUser(userId, updates) {
    try {
      await db.collection(collections.USERS).doc(userId).update({
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async getAllUsers() {
    try {
      const usersSnapshot = await db.collection(collections.USERS).get();
      return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  },

  async updateUserStatus(userId, status) {
    try {
      await db.collection(collections.USERS).doc(userId).update({ status });
      return { success: true };
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Institution operations
  async createInstitution(institutionData) {
    try {
      const institutionRef = db.collection(collections.INSTITUTIONS).doc();
      await institutionRef.set({
        ...institutionData,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      return { id: institutionRef.id, ...institutionData };
    } catch (error) {
      console.error('Error creating institution:', error);
      throw error;
    }
  },

  async getInstitutions() {
    try {
      const institutionsSnapshot = await db.collection(collections.INSTITUTIONS).get();
      return institutionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting institutions:', error);
      return [];
    }
  },

  async getInstitutionById(institutionId) {
    try {
      const institutionDoc = await db.collection(collections.INSTITUTIONS).doc(institutionId).get();
      return institutionDoc.exists ? { id: institutionDoc.id, ...institutionDoc.data() } : null;
    } catch (error) {
      console.error('Error getting institution by ID:', error);
      return null;
    }
  },

  async updateInstitutionStatus(institutionId, status) {
    try {
      await db.collection(collections.INSTITUTIONS).doc(institutionId).update({ status });
      return { success: true };
    } catch (error) {
      console.error('Error updating institution status:', error);
      throw error;
    }
  },

  async updateInstitution(institutionId, updates) {
    try {
      await db.collection(collections.INSTITUTIONS).doc(institutionId).update({
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating institution:', error);
      throw error;
    }
  },

  // Course operations
  async getCourseById(courseId) {
    try {
      const courseDoc = await db.collection(collections.COURSES).doc(courseId).get();
      return courseDoc.exists ? { id: courseDoc.id, ...courseDoc.data() } : null;
    } catch (error) {
      console.error('Error getting course by ID:', error);
      return null;
    }
  },

  async createCourse(courseData) {
    try {
      const courseRef = db.collection(collections.COURSES).doc();
      await courseRef.set({
        ...courseData,
        createdAt: new Date().toISOString(),
        status: 'open'
      });
      return { id: courseRef.id, ...courseData };
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  async getCoursesByInstitution(institutionId) {
    try {
      const coursesSnapshot = await db.collection(collections.COURSES)
        .where('institutionId', '==', institutionId)
        .get();
      return coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting courses:', error);
      return [];
    }
  },

  async getAllCourses() {
    try {
      const coursesSnapshot = await db.collection(collections.COURSES).get();
      return coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all courses:', error);
      return [];
    }
  },

  // Application operations
  async createApplication(applicationData) {
    try {
      const applicationRef = db.collection(collections.APPLICATIONS).doc();
      await applicationRef.set({
        ...applicationData,
        applicationDate: new Date().toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      return { id: applicationRef.id, ...applicationData };
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  },

  async getStudentApplications(studentId) {
    try {
      const applicationsSnapshot = await db.collection(collections.APPLICATIONS)
        .where('studentId', '==', studentId)
        .get();
      return applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting applications:', error);
      return [];
    }
  },

  async getAllApplications() {
    try {
      const applicationsSnapshot = await db.collection(collections.APPLICATIONS).get();
      return applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all applications:', error);
      return [];
    }
  },

  async getApplicationsByInstitution(institutionId) {
    try {
      const applicationsSnapshot = await db.collection(collections.APPLICATIONS)
        .where('institutionId', '==', institutionId)
        .get();
      return applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting applications by institution:', error);
      return [];
    }
  },

  async updateApplicationStatus(applicationId, status) {
    try {
      await db.collection(collections.APPLICATIONS).doc(applicationId).update({ 
        status,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  // User verification status update
  async updateUserVerificationStatus(userId, status) {
    try {
      await db.collection(collections.USERS).doc(userId).update({
        verificationStatus: status,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user verification status:', error);
      throw error;
    }
  },

  // Get all faculties
  async getAllFaculties() {
    try {
      const facultiesSnapshot = await db.collection(collections.FACULTIES).get();
      return facultiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all faculties:', error);
      return [];
    }
  },

  // Get faculties by institution
  async getFacultiesByInstitution(institutionId) {
    try {
      const facultiesSnapshot = await db.collection(collections.FACULTIES)
        .where('institutionId', '==', institutionId)
        .get();
      return facultiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting faculties by institution:', error);
      return [];
    }
  },

  // Get company by ID
  async getCompanyById(companyId) {
    try {
      const companyDoc = await db.collection(collections.USERS).doc(companyId).get();
      return companyDoc.exists ? { id: companyDoc.id, ...companyDoc.data() } : null;
    } catch (error) {
      console.error('Error getting company by ID:', error);
      return null;
    }
  },

  // Get system reports
  async getSystemReports(params = {}) {
    try {
      const [users, institutions, companies, applications, jobs] = await Promise.all([
        this.getAllUsers(),
        this.getInstitutions(),
        this.getCompanies(),
        this.getAllApplications(),
        this.getAllJobs()
      ]);

      return {
        totalUsers: users.length,
        totalInstitutions: institutions.length,
        totalCompanies: companies.length,
        totalApplications: applications.length,
        totalJobs: jobs.length,
        pendingInstitutions: institutions.filter(inst => inst.status === 'pending').length,
        pendingCompanies: companies.filter(comp => comp.status === 'pending').length
      };
    } catch (error) {
      console.error('Error getting system reports:', error);
      return {};
    }
  },

  // Job operations
  async createJob(jobData) {
    try {
      const jobRef = db.collection(collections.JOBS).doc();
      await jobRef.set({
        ...jobData,
        postedDate: new Date().toISOString(),
        status: 'open'
      });
      return { id: jobRef.id, ...jobData };
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  async getJobsByCompany(companyId) {
    try {
      const jobsSnapshot = await db.collection(collections.JOBS)
        .where('companyId', '==', companyId)
        .get();
      return jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting jobs:', error);
      return [];
    }
  },

  async getAllJobs() {
    try {
      const jobsSnapshot = await db.collection(collections.JOBS).get();
      return jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all jobs:', error);
      return [];
    }
  },

  async updateJobStatus(jobId, status) {
    try {
      await db.collection(collections.JOBS).doc(jobId).update({ 
        status,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  },

  // Company operations
  async getCompanies() {
    try {
      const companiesSnapshot = await db.collection(collections.USERS)
        .where('role', '==', 'company')
        .get();
      return companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting companies:', error);
      return [];
    }
  },

  async updateCompanyStatus(companyId, status) {
    try {
      await db.collection(collections.USERS).doc(companyId).update({ status });
      return { success: true };
    } catch (error) {
      console.error('Error updating company status:', error);
      throw error;
    }
  }
};

module.exports = { 
  admin, 
  db, 
  auth, 
  collections, 
  firestoreHelper 
};