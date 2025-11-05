import React, { useState, useEffect } from 'react';
import { institutionService } from '../../services/institutionService';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../contexts/AuthContext';

const CourseApplication = () => {
  const [courses, setCourses] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesResponse, institutionsResponse] = await Promise.all([
        institutionService.getCourses(),
        institutionService.getInstitutions()
      ]);

      if (coursesResponse.success) {
        setCourses(coursesResponse.data);
      }
      if (institutionsResponse.success) {
        setInstitutions(institutionsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (courseId) => {
    try {
      setApplying(courseId);
      
      // Check if student already has 2 applications for this institution
      const course = courses.find(c => c.id === courseId);
      const institutionCourses = courses.filter(c => c.institutionId === course.institutionId);
      const studentApplications = await studentService.getStudentApplications(user.id);
      
      const applicationsForInstitution = studentApplications.data.filter(
        app => institutionCourses.some(c => c.id === app.courseId)
      );

      if (applicationsForInstitution.length >= 2) {
        alert('You can only apply for maximum 2 courses per institution');
        return;
      }

      // Submit application
      const applicationData = {
        studentId: user.id,
        courseId: courseId,
        institutionId: course.institutionId,
        studentName: user.name,
        studentEmail: user.email,
        courseName: course.name,
        institutionName: course.institutionName,
        applicationDate: new Date().toISOString(),
        status: 'pending',
        documents: []
      };

      const response = await studentService.submitApplication(applicationData);
      
      if (response.success) {
        alert('Application submitted successfully!');
        // Reload courses to update application status
        loadData();
      } else {
        alert('Failed to submit application: ' + response.message);
      }
    } catch (error) {
      console.error('Application error:', error);
      alert('Error submitting application');
    } finally {
      setApplying(null);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInstitution = selectedInstitution === 'all' || course.institutionId === selectedInstitution;
    return matchesSearch && matchesInstitution;
  });

  const getInstitutionName = (institutionId) => {
    const institution = institutions.find(inst => inst.id === institutionId);
    return institution?.name || 'Unknown Institution';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for Courses</h1>
        <p className="text-gray-600">Browse available courses and submit your applications</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Courses
            </label>
            <input
              type="text"
              placeholder="Search by course name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Institution
            </label>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Institutions</option>
              {institutions.map(institution => (
                <option key={institution.id} value={institution.id}>
                  {institution.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-900">{course.name}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  course.status === 'open' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {course.status === 'open' ? 'Open' : 'Closed'}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {course.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {getInstitutionName(course.institutionId)}
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Duration: {course.duration}
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Fees: M{course.fees?.toLocaleString() || 'N/A'}
                </div>

                {course.requirements && (
                  <div className="text-sm text-gray-500">
                    <strong>Requirements:</strong> {course.requirements.join(', ')}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleApply(course.id)}
                disabled={course.status !== 'open' || applying === course.id}
                className={`w-full py-2 px-4 rounded-md font-medium ${
                  course.status === 'open'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {applying === course.id ? 'Applying...' : 
                 course.status === 'open' ? 'Apply Now' : 'Applications Closed'}
              </button>

              {course.applicationDeadline && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Deadline: {new Date(course.applicationDeadline).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l-9 5m9-5v9" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedInstitution !== 'all' 
              ? 'Try adjusting your search filters' 
              : 'No courses are currently available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseApplication;