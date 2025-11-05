// src/components/student/InstitutionCourses.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { institutionService } from '../../services/institutionService';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../contexts/AuthContext';

const InstitutionCourses = () => {
  const { institutionId } = useParams();
  const { user } = useAuth();
  
  const [institution, setInstitution] = useState(null);
  const [courses, setCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Load institution data
      const institutionResponse = await institutionService.getInstitution(institutionId);
      
      if (!institutionResponse.success) {
        throw new Error(institutionResponse.message || 'Failed to load institution');
      }

      setInstitution(institutionResponse.data);

      // Load courses for this institution
      const coursesResponse = await institutionService.getCoursesByInstitution(institutionId);
      
      if (coursesResponse.success) {
        setCourses(coursesResponse.data || []);
      } else {
        setCourses([]);
      }

      // Load student's existing applications
      if (user?.uid) {
        const applicationsResponse = await studentService.getStudentApplications(user.uid);
        
        if (applicationsResponse.success) {
          setApplications(applicationsResponse.data || []);
        }
      }

    } catch (err) {
      setError(err.message || 'Failed to load institution data');
    } finally {
      setLoading(false);
    }
  }, [institutionId, user?.uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApply = async (courseId, courseName) => {
    try {
      setApplying(courseId);
      setError('');
      setSuccessMessage('');

      // Check if student has already applied to 2 courses at this institution
      const institutionApplications = applications.filter(
        app => app.institutionId === institutionId
      );

      if (institutionApplications.length >= 2) {
        setError(`You have already applied to ${institutionApplications.length} courses at this institution. Maximum 2 applications per institution allowed.`);
        setApplying(null);
        return;
      }

      // Check if already applied to this specific course
      const alreadyApplied = applications.find(
        app => app.courseId === courseId && app.institutionId === institutionId
      );

      if (alreadyApplied) {
        setError(`You have already applied to ${courseName}.`);
        setApplying(null);
        return;
      }

      // Submit application
      const applicationData = {
        studentId: user.uid,
        studentName: user.firstName + ' ' + (user.lastName || ''),
        studentEmail: user.email,
        institutionId: institutionId,
        institutionName: institution?.name,
        courseId: courseId,
        courseName: courseName,
        status: 'pending',
        applicationDate: new Date().toISOString()
      };

      const result = await studentService.submitApplication(applicationData);

      if (result.success) {
        setSuccessMessage(`Successfully applied to ${courseName}!`);
        // Reload applications to update the count
        const applicationsResponse = await studentService.getStudentApplications(user.uid);
        if (applicationsResponse.success) {
          setApplications(applicationsResponse.data || []);
        }
      } else {
        setError(result.message || 'Failed to submit application');
      }

    } catch (err) {
      setError('Failed to submit application: ' + err.message);
    } finally {
      setApplying(null);
    }
  };

  const getApplicationStatus = (courseId) => {
    const application = applications.find(
      app => app.courseId === courseId && app.institutionId === institutionId
    );
    return application ? application.status : null;
  };

  const getApplicationsCount = () => {
    return applications.filter(app => app.institutionId === institutionId).length;
  };

  const canApplyToMore = () => {
    return getApplicationsCount() < 2;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading courses...</div>
      </div>
    );
  }

  if (error && !institution) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-900 border border-red-700 rounded-lg p-6">
            <div className="text-red-400 mx-auto mb-4 text-4xl">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">Failed to load institution data</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <p className="text-sm text-gray-400 mb-4">Institution ID: {institutionId}</p>
            <p className="text-gray-300 mb-4">
              The institution you're looking for doesn't exist or there was an error loading the data.
            </p>
            <Link
              to="/student/apply"
              className="btn-professional inline-block"
            >
              ← Back to Institutions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="professional-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                to="/student/apply"
                className="text-blue-300 hover:text-orange-400 flex items-center"
              >
                ← Back to Institutions
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {institution?.name || 'Institution Courses'}
                </h1>
                {institution?.location && (
                  <p className="text-gray-300">{institution.location}</p>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-300">
              Applications: {getApplicationsCount()}/2
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-900 border border-red-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-400 mr-3 text-xl">⚠️</div>
              <span className="text-red-200">{error}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-900 border border-green-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-green-400 mr-3 text-xl">✅</div>
              <span className="text-green-200">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Institution Info */}
        {institution && (
          <div className="elegant-card p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">About {institution.name}</h2>
            {institution.description && (
              <p className="text-gray-300 mb-4">{institution.description}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
              {institution.email && (
                <div className="flex items-center">
                  {institution.email}
                </div>
              )}
              {institution.website && (
                <div className="flex items-center">
                  <a href={institution.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-orange-400">
                    Visit Website
                  </a>
                </div>
              )}
              <div className="flex items-center">
                {courses.length} course{courses.length !== 1 ? 's' : ''} available
              </div>
            </div>
          </div>
        )}

        {/* Application Limit Warning */}
        {!canApplyToMore() && (
          <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="text-yellow-400 mr-3 text-xl">📚</div>
              <div>
                <h3 className="text-sm font-medium text-yellow-200">Application Limit Reached</h3>
                <p className="text-sm text-yellow-300 mt-1">
                  You have reached the maximum of 2 applications for this institution. 
                  You can withdraw an existing application to apply for a different course.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Courses List */}
        <div className="elegant-card p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Available Courses</h2>
          
          {courses.length > 0 ? (
            <div className="space-y-6">
              {courses.map((course) => {
                const applicationStatus = getApplicationStatus(course.id);
                const isApplied = !!applicationStatus;
                
                return (
                  <div key={course.id} className="border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {course.name}
                        </h3>
                        {applicationStatus && (
                          <span className={`status-badge ${
                            applicationStatus === 'pending' ? 'bg-yellow-500 text-black' :
                            applicationStatus === 'approved' ? 'bg-green-500 text-white' :
                            applicationStatus === 'rejected' ? 'bg-red-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-white">
                          M{course.fees?.toLocaleString() || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-400">per year</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-400">
                      <div>
                        <p><strong>Duration:</strong> {course.duration || 'Not specified'}</p>
                        <p><strong>Seats Available:</strong> {course.seatsAvailable || 'Not specified'}</p>
                      </div>
                      <div>
                        <p><strong>Status:</strong> 
                          <span className={`ml-1 ${
                            course.status === 'open' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {course.status?.charAt(0).toUpperCase() + course.status?.slice(1) || 'Unknown'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {course.description && (
                      <p className="text-gray-300 mb-4">{course.description}</p>
                    )}

                    {course.requirements && course.requirements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Entry Requirements:</h4>
                        <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
                          {course.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                      <div className="text-sm text-gray-400">
                        {isApplied ? (
                          <span className="flex items-center text-green-400">
                            Application {applicationStatus}
                          </span>
                        ) : (
                          <span>
                            {canApplyToMore() ? 'Ready to apply' : 'Application limit reached'}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleApply(course.id, course.name)}
                        disabled={isApplied || !canApplyToMore() || applying === course.id}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          isApplied
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : !canApplyToMore()
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'btn-professional'
                        } transition-colors flex items-center`}
                      >
                        {applying === course.id ? (
                          'Applying...'
                        ) : isApplied ? (
                          'Applied'
                        ) : !canApplyToMore() ? (
                          'Limit Reached'
                        ) : (
                          'Apply Now'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mx-auto mb-4 text-4xl">📚</div>
              <h3 className="text-lg font-medium text-white mb-2">No courses available</h3>
              <p className="text-gray-400">
                This institution doesn't have any courses listed at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstitutionCourses;