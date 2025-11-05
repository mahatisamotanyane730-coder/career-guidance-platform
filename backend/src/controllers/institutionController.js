const { db } = require('../config/firebase');

// @desc    Get courses by institution
// @route   GET /api/institutions/:id/courses
// @access  Public
const getCoursesByInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Fetching courses for institution:', id);
    
    // Get ALL courses first to debug
    const allCoursesSnapshot = await db.collection('courses').get();
    console.log('Total courses in database:', allCoursesSnapshot.size);
    
    // Log all courses for debugging
    allCoursesSnapshot.forEach(doc => {
      const courseData = doc.data();
      console.log(`Course ${doc.id}:`, {
        name: courseData.name,
        institutionId: courseData.institutionId,
        hasInstitutionId: !!courseData.institutionId
      });
    });
    
    // Try to get courses for this institution
    const coursesSnapshot = await db.collection('courses')
      .where('institutionId', '==', id)
      .get();
    
    console.log(`Found ${coursesSnapshot.size} courses for institution ${id}`);
    
    if (coursesSnapshot.empty) {
      return res.json({
        success: true,
        message: 'No courses found for this institution',
        data: [],
        count: 0
      });
    }
    
    const courses = [];
    coursesSnapshot.forEach(doc => {
      const courseData = doc.data();
      console.log('Processing course:', doc.id, courseData);
      
      courses.push({
        id: doc.id,
        name: courseData.name,
        description: courseData.description,
        duration: courseData.duration,
        fees: courseData.fees,
        status: courseData.status || 'open',
        availableSeats: courseData.seatsAvailable || courseData.availableSeats || 0,
        seats: courseData.seatsAvailable || courseData.seats || 50,
        institutionId: courseData.institutionId,
        requirements: {
          subjects: courseData.requirements || [],
          minimumGrade: courseData.minimumGrade || 'C',
          additionalRequirements: courseData.additionalRequirements || ''
        },
        createdAt: courseData.createdAt,
        applicationDeadline: courseData.applicationDeadline
      });
    });
    
    res.json({
      success: true,
      message: 'Courses retrieved successfully',
      data: courses,
      count: courses.length
    });
    
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// @desc    Get all institutions
// @route   GET /api/institutions
// @access  Public
const getInstitutions = async (req, res) => {
  try {
    const institutionsSnapshot = await db.collection('institutions').get();
    
    if (institutionsSnapshot.empty) {
      return res.json({
        success: true,
        message: 'No institutions found',
        data: []
      });
    }
    
    const institutions = [];
    institutionsSnapshot.forEach(doc => {
      const institutionData = doc.data();
      institutions.push({
        id: doc.id,
        name: institutionData.name,
        location: institutionData.location,
        description: institutionData.description,
        email: institutionData.email,
        status: institutionData.status,
        createdAt: institutionData.createdAt
      });
    });
    
    res.json({
      success: true,
      message: 'Institutions retrieved successfully',
      data: institutions
    });
    
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching institutions',
      error: error.message
    });
  }
};

// @desc    Get single institution
// @route   GET /api/institutions/:id
// @access  Public
const getInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Fetching institution with ID:', id);
    
    const doc = await db.collection('institutions').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }
    
    const institutionData = doc.data();
    
    res.json({
      success: true,
      data: {
        id: doc.id,
        ...institutionData
      }
    });
    
  } catch (error) {
    console.error('Error fetching institution:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching institution',
      error: error.message
    });
  }
};

// Other existing functions...
const getCourses = async (req, res) => {
  try {
    const coursesSnapshot = await db.collection('courses').get();
    
    const courses = [];
    coursesSnapshot.forEach(doc => {
      const courseData = doc.data();
      courses.push({
        id: doc.id,
        name: courseData.name,
        description: courseData.description,
        duration: courseData.duration,
        institutionId: courseData.institutionId,
        status: courseData.status || 'open'
      });
    });
    
    res.json({
      success: true,
      message: 'Courses retrieved successfully',
      data: courses
    });
    
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

const getInstitutionDashboard = async (req, res) => {
  try {
    const institutionId = req.user.id;
    
    // Get institution courses
    const coursesSnapshot = await db.collection('courses')
      .where('institutionId', '==', institutionId)
      .get();
    
    const courses = [];
    coursesSnapshot.forEach(doc => {
      courses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get applications for this institution's courses
    const applicationsSnapshot = await db.collection('applications')
      .where('institutionId', '==', institutionId)
      .get();
    
    const applications = [];
    applicationsSnapshot.forEach(doc => {
      applications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Calculate stats
    const stats = {
      totalCourses: courses.length,
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      approvedApplications: applications.filter(app => app.status === 'approved').length,
      rejectedApplications: applications.filter(app => app.status === 'rejected').length,
      admittedApplications: applications.filter(app => app.status === 'admitted').length
    };
    
    res.json({
      success: true,
      data: {
        institution: req.user,
        courses,
        applications: applications.slice(0, 10), // Recent 10 applications
        stats
      }
    });
    
  } catch (error) {
    console.error('Error fetching institution dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard',
      error: error.message
    });
  }
};

module.exports = {
  getInstitutions,
  getInstitution,
  getCourses,
  getCoursesByInstitution,
  getInstitutionDashboard
};