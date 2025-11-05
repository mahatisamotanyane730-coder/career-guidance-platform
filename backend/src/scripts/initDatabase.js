const { firestoreHelper, collections } = require('../config/firebase');

const initializeSampleData = async () => {
  console.log('🚀 Initializing sample data...');

  try {
    // Create sample institutions
    const institutions = [
      {
        name: 'National University of Lesotho',
        email: 'admissions@nul.ls',
        description: 'Premier higher education institution in Lesotho',
        location: 'Roma, Lesotho',
        contactInfo: {
          phone: '+266 22340601',
          address: 'P.O. Roma 180, Lesotho'
        },
        status: 'active',
        adminId: 'admin-user-id'
      },
      {
        name: 'Limkokwing University of Creative Technology',
        email: 'info@limkokwing.ls',
        description: 'Innovative university focusing on creative technology',
        location: 'Maseru, Lesotho',
        contactInfo: {
          phone: '+266 22317242',
          address: 'Kingsway Road, Maseru'
        },
        status: 'active',
        adminId: 'admin-user-id'
      }
    ];

    for (const institutionData of institutions) {
      await firestoreHelper.createInstitution(institutionData);
    }

    // Create sample courses
    const courses = [
      {
        name: 'Computer Science',
        institutionId: 'institution-id-1',
        facultyId: 'faculty-id-1',
        description: 'Bachelor of Science in Computer Science',
        requirements: ['Mathematics', 'Physics', 'English'],
        duration: '4 years',
        fees: 25000,
        seatsAvailable: 50,
        status: 'open'
      },
      {
        name: 'Business Administration',
        institutionId: 'institution-id-1',
        facultyId: 'faculty-id-2',
        description: 'Bachelor of Business Administration',
        requirements: ['Mathematics', 'Commerce', 'English'],
        duration: '3 years',
        fees: 20000,
        seatsAvailable: 100,
        status: 'open'
      }
    ];

    for (const courseData of courses) {
      await firestoreHelper.createCourse(courseData);
    }

    console.log('✅ Sample data initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
  }
};

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeSampleData();
}

module.exports = { initializeSampleData };