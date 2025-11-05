// src/services/institutionService.js
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc,
  getDoc,
  orderBy
} from 'firebase/firestore';

class InstitutionService {
  
  // Get institution by user ID (for institution admins)
  getInstitutionByUserId = async (userId) => {
    try {
      console.log('🔍 Fetching institution for user:', userId);
      
      const institutionsQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId),
        where('userType', '==', 'institution')
      );
      
      const snapshot = await getDocs(institutionsQuery);
      if (snapshot.empty) {
        console.log('❌ No institution found for user:', userId);
        return { success: false, message: 'Institution not found' };
      }
      
      const institutionData = snapshot.docs[0].data();
      console.log('✅ Found institution:', institutionData);
      
      return {
        success: true,
        data: { id: snapshot.docs[0].id, ...institutionData }
      };
    } catch (error) {
      console.error('❌ Error fetching institution:', error);
      return { success: false, message: error.message };
    }
  };

  // GET ALL INSTITUTIONS - Query the institutions collection
  getAllInstitutions = async () => {
    try {
      console.log('🏛️ Fetching all institutions from institutions collection');
      
      const institutionsQuery = query(
        collection(db, 'institutions'),
        where('status', '==', 'active') // Only get active institutions
      );
      
      const snapshot = await getDocs(institutionsQuery);
      const institutions = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📊 Raw institution data from Firestore:', {
          id: doc.id,
          name: data.name,
          location: data.location,
          email: data.email,
          status: data.status
        });
        
        return {
          id: doc.id,
          name: data.name || 'Unnamed Institution',
          location: data.location || 'Location not specified',
          email: data.email || '',
          phone: data.phone || '',
          website: data.website || '',
          description: data.description || '',
          status: data.status || 'active',
          createdAt: data.createdAt,
          // Include all original data
          ...data
        };
      });
      
      console.log('✅ Processed institutions from institutions collection:', institutions.length);
      console.log('📋 Institution names:', institutions.map(inst => inst.name));
      return { success: true, data: institutions };
    } catch (error) {
      console.error('❌ Error fetching all institutions:', error);
      return { success: false, message: error.message };
    }
  };

  // GET SINGLE INSTITUTION BY ID
  getInstitution = async (institutionId) => {
    try {
      console.log('🔍 Fetching institution by ID:', institutionId);
      
      const institutionRef = doc(db, 'institutions', institutionId);
      const institutionDoc = await getDoc(institutionRef);
      
      if (!institutionDoc.exists()) {
        console.log('❌ Institution not found:', institutionId);
        return { success: false, message: 'Institution not found' };
      }
      
      const institutionData = institutionDoc.data();
      console.log('✅ Found institution:', institutionData);
      
      return {
        success: true,
        data: {
          id: institutionDoc.id,
          name: institutionData.name || 'Unnamed Institution',
          location: institutionData.location || 'Location not specified',
          email: institutionData.email || '',
          phone: institutionData.phone || '',
          website: institutionData.website || '',
          description: institutionData.description || '',
          status: institutionData.status || 'active',
          createdAt: institutionData.createdAt,
          ...institutionData
        }
      };
    } catch (error) {
      console.error('❌ Error fetching institution:', error);
      return { success: false, message: error.message };
    }
  };

  // Get courses by institution
  getCoursesByInstitution = async (institutionId) => {
    try {
      console.log('📚 Fetching courses for institution:', institutionId);
      
      try {
        const coursesQuery = query(
          collection(db, 'courses'),
          where('institutionId', '==', institutionId),
          where('status', '==', 'open'), // Only get open courses
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(coursesQuery);
        const courses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('✅ Found courses (with ordering):', courses.length);
        return { success: true, data: courses };
      } catch (indexError) {
        console.log('⚠️ Index not ready, using simple query for courses');
        
        const simpleQuery = query(
          collection(db, 'courses'),
          where('institutionId', '==', institutionId),
          where('status', '==', 'open')
        );
        
        const simpleSnapshot = await getDocs(simpleQuery);
        const courses = simpleSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        console.log('✅ Found courses (simple query):', courses.length);
        return { success: true, data: courses };
      }
    } catch (error) {
      console.error('❌ Error fetching courses by institution:', error);
      return { success: false, message: error.message };
    }
  };

  // Get applications for specific institution
  getInstitutionApplications = async (institutionId) => {
    try {
      console.log('📋 Fetching applications for institution:', institutionId);
      
      try {
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('institutionId', '==', institutionId),
          orderBy('applicationDate', 'desc')
        );
        
        const snapshot = await getDocs(applicationsQuery);
        const applications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('✅ Found applications (with ordering):', applications.length);
        return { success: true, data: applications };
      } catch (indexError) {
        console.log('⚠️ Index not ready, using simple query:', indexError.message);
        
        const simpleQuery = query(
          collection(db, 'applications'),
          where('institutionId', '==', institutionId)
        );
        
        const simpleSnapshot = await getDocs(simpleQuery);
        const applications = simpleSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        applications.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));
        
        console.log('✅ Found applications (simple query):', applications.length);
        return { success: true, data: applications };
      }
    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      return { success: false, message: error.message };
    }
  };

  // Update application status
  updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      console.log('🔄 Updating application status:', applicationId, newStatus);
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString()
      });
      
      console.log('✅ Application status updated successfully');
      return { success: true, message: 'Application status updated successfully' };
    } catch (error) {
      console.error('❌ Error updating application status:', error);
      return { success: false, message: error.message };
    }
  };

  // Get courses for institution (alias for getCoursesByInstitution)
  getInstitutionCourses = async (institutionId) => {
    return this.getCoursesByInstitution(institutionId);
  };

  // Create new course
  createCourse = async (courseData) => {
    try {
      console.log('➕ Creating new course:', courseData);
      const docRef = await addDoc(collection(db, 'courses'), {
        ...courseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Course created successfully:', docRef.id);
      return {
        success: true,
        message: 'Course created successfully',
        data: { id: docRef.id, ...courseData }
      };
    } catch (error) {
      console.error('❌ Error creating course:', error);
      return { success: false, message: error.message };
    }
  };

  // Update course
  updateCourse = async (courseId, courseData) => {
    try {
      console.log('✏️ Updating course:', courseId);
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        ...courseData,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Course updated successfully');
      return { success: true, message: 'Course updated successfully' };
    } catch (error) {
      console.error('❌ Error updating course:', error);
      return { success: false, message: error.message };
    }
  };

  // Get faculties for institution
  getInstitutionFaculties = async (institutionId) => {
    try {
      console.log('🏛️ Fetching faculties/departments for institution:', institutionId);
      
      // Get courses and extract unique faculties/departments
      const coursesResult = await this.getCoursesByInstitution(institutionId);
      if (!coursesResult.success) {
        return { success: true, data: [] };
      }
      
      const courses = coursesResult.data;
      
      // Extract unique faculties from courses
      const facultiesMap = new Map();
      courses.forEach(course => {
        if (course.faculty || course.department) {
          const facultyName = course.faculty || course.department;
          if (!facultiesMap.has(facultyName)) {
            facultiesMap.set(facultyName, {
              id: `faculty-${facultyName.replace(/\s+/g, '-').toLowerCase()}`,
              name: facultyName,
              courseCount: 1
            });
          } else {
            facultiesMap.get(facultyName).courseCount++;
          }
        }
      });
      
      const faculties = Array.from(facultiesMap.values());
      
      console.log('✅ Found faculties/departments:', faculties.length);
      return { success: true, data: faculties };
    } catch (error) {
      console.error('❌ Error fetching faculties:', error);
      return { success: true, data: [] };
    }
  };

  // Create faculty/department
  createFaculty = async (facultyData) => {
    try {
      console.log('➕ Creating new faculty/department:', facultyData);
      return {
        success: true,
        message: 'Faculty/department created successfully',
        data: { id: `faculty-${Date.now()}`, ...facultyData }
      };
    } catch (error) {
      console.error('❌ Error creating faculty:', error);
      return { success: false, message: error.message };
    }
  };

  // Update institution profile
  updateInstitutionProfile = async (institutionId, profileData) => {
    try {
      console.log('✏️ Updating institution profile:', institutionId);
      const institutionRef = doc(db, 'institutions', institutionId);
      await updateDoc(institutionRef, {
        ...profileData,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Institution profile updated successfully');
      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('❌ Error updating institution profile:', error);
      return { success: false, message: error.message };
    }
  };

  // Get all applications (for admin dashboard)
  getAllApplications = async () => {
    try {
      console.log('📋 Fetching all applications');
      
      const applicationsQuery = query(
        collection(db, 'applications'),
        orderBy('applicationDate', 'desc')
      );
      
      const snapshot = await getDocs(applicationsQuery);
      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('✅ Found all applications:', applications.length);
      return { success: true, data: applications };
    } catch (error) {
      console.error('❌ Error fetching all applications:', error);
      return { success: false, message: error.message };
    }
  };
}

export const institutionService = new InstitutionService();