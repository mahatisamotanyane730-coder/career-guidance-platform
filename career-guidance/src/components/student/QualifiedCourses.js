import React, { useState, useEffect, useCallback } from 'react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const QualifiedCourses = () => {
  const [qualifiedCourses, setQualifiedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingCourse, setApplyingCourse] = useState(null);

  const { user } = useAuth();

  const loadInstitutions = useCallback(async () => {
    try {
      const institutionsSnapshot = await studentService.getAllInstitutions();
      if (institutionsSnapshot.success) {
        const institutionsMap = {};
        institutionsSnapshot.data.forEach(inst => {
          institutionsMap[inst.id] = inst;
        });
        return institutionsMap;
      }
      return {};
    } catch (error) {
      console.error('Error loading institutions:', error);
      return {};
    }
  }, []);

  const loadStudentApplications = useCallback(async () => {
    try {
      if (user?.uid) {
        const applicationsResponse = await studentService.getStudentApplications(user.uid);
        if (applicationsResponse.success) {
          return applicationsResponse.data || [];
        }
      }
      return [];
    } catch (error) {
      console.error('Error loading applications:', error);
      return [];
    }
  }, [user?.uid]);

  const loadQualifiedCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const institutionsMap = await loadInstitutions();
      const applications = await loadStudentApplications();

      const transcriptResult = await studentService.getTranscriptWithStudentId(user.uid);
      
      if (!transcriptResult.success || !transcriptResult.data) {
        setError('No transcript found. Please upload your high school subjects first.');
        setLoading(false);
        return;
      }

      const studentTranscript = transcriptResult.data;
      setTranscript(studentTranscript);

      const coursesResponse = await studentService.getAllCourses();
      
      if (coursesResponse.success) {
        const allCourses = coursesResponse.data || [];
        setAllCourses(allCourses.length);

        const enhancedCourses = allCourses.map(course => {
          const institution = institutionsMap[course.institutionId];
          
          // Check if student has already applied to this course
          const hasApplied = applications.some(app => 
            app.courseId === course.id && app.institutionId === course.institutionId
          );

          return {
            ...course,
            institutionName: institution?.name || 'Unknown Institution',
            institutionLocation: institution?.location,
            institutionEmail: institution?.email,
            hasApplied: hasApplied
          };
        });

        const qualified = enhancedCourses.filter(course => {
          if (!course.requirements || course.requirements.length === 0) {
            return true;
          }

          const hasAllRequiredSubjects = course.requirements.every(requirement => {
            const cleanRequirement = requirement.trim();
            return studentTranscript.completedSubjects && 
                   studentTranscript.completedSubjects.includes(cleanRequirement);
          });

          return hasAllRequiredSubjects;
        });

        setQualifiedCourses(qualified);
        
        if (qualified.length === 0) {
          setError('No courses found that match your high school subjects. You may need to complete additional subjects.');
        }
      } else {
        setError('Failed to load courses: ' + coursesResponse.message);
      }
    } catch (err) {
      console.error('Error loading qualified courses:', err);
      setError('Error loading qualified courses: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, loadInstitutions, loadStudentApplications]);

  const handleDirectApply = async (course) => {
    if (!user?.uid) {
      alert('Please log in to apply for courses.');
      return;
    }

    if (course.hasApplied) {
      alert(`You have already applied to ${course.name} at ${course.institutionName}.`);
      return;
    }

    setApplyingCourse(course.id);

    try {
      // Check if student already has applications
      const applicationsResponse = await studentService.getStudentApplications(user.uid);
      
      if (applicationsResponse.success) {
        const currentApplications = applicationsResponse.data || [];
        
        // Check if student has 2 applications for this institution
        const institutionApplications = currentApplications.filter(app => 
          app.institutionId === course.institutionId
        );

        if (institutionApplications.length >= 2) {
          alert(`You already have ${institutionApplications.length} applications for ${course.institutionName}. Maximum 2 applications per institution allowed.`);
          setApplyingCourse(null);
          return;
        }
      }

      // Create application data for Firestore
      const applicationData = {
        studentId: user.uid,
        studentName: `${user.firstName} ${user.lastName}`,
        studentEmail: user.email,
        courseId: course.id,
        courseName: course.name,
        institutionId: course.institutionId,
        institutionName: course.institutionName,
        applicationDate: new Date().toISOString(),
        status: 'pending',
        transcriptData: {
          highSchool: transcript.highSchool,
          yearCompleted: transcript.yearCompleted,
          completedSubjects: transcript.completedSubjects
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Submitting application:', applicationData);

      // Submit application to Firestore
      const result = await studentService.submitApplication(applicationData);
      
      if (result.success) {
        alert(`Successfully applied to ${course.name} at ${course.institutionName}!`);
        // Reload to update application status
        await loadQualifiedCourses();
      } else {
        alert('Failed to submit application: ' + result.message);
      }
    } catch (error) {
      console.error('Error applying to course:', error);
      alert('Error applying to course: ' + error.message);
    } finally {
      setApplyingCourse(null);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadQualifiedCourses();
    }
  }, [loadQualifiedCourses, user?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Finding courses that match your subjects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="professional-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                to="/student/dashboard"
                className="text-blue-300 hover:text-orange-400 flex items-center transition-colors duration-300"
              >
                ← Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Courses You Qualify For
                </h1>
                <p className="text-gray-300">
                  Automatically matched based on your high school subjects
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-300">
              {qualifiedCourses.length} of {allCourses} courses
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-900 border border-red-700 rounded-lg p-4 transition-all duration-300">
            <div className="flex items-center">
              <span className="text-red-200">{error}</span>
            </div>
          </div>
        )}

        {transcript && (
          <div className="elegant-card p-6 mb-6 bg-gradient-to-r from-blue-900 to-purple-900 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-white">Your High School Subjects</h2>
              <Link
                to="/student/dashboard?edit=transcript"
                className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300 flex items-center"
              >
                Edit Subjects
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-300 text-sm">High School</p>
                <p className="text-white font-medium">{transcript.highSchool}</p>
              </div>
              <div>
                <p className="text-gray-300 text-sm">Year Completed</p>
                <p className="text-white font-medium">{transcript.yearCompleted}</p>
              </div>
              <div>
                <p className="text-gray-300 text-sm">Subjects Completed</p>
                <p className="text-white font-medium">{transcript.completedSubjects?.length || 0}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-300 text-sm mb-2">Your Completed Subjects:</p>
              <div className="flex flex-wrap gap-2">
                {transcript.completedSubjects?.map((subject) => (
                  <div key={subject} className="bg-green-600 rounded-lg px-3 py-1 transition-all duration-300 hover:bg-green-700">
                    <span className="text-white text-sm font-medium">{subject}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="elegant-card p-6 transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              Matched Courses ({qualifiedCourses.length})
            </h2>
            <div className="text-sm text-gray-400">
              You qualify based on your high school subjects
            </div>
          </div>

          {qualifiedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qualifiedCourses.map((course) => (
                <div key={course.id} className={`border rounded-lg p-6 bg-gradient-to-br from-gray-800 to-gray-900 transition-all duration-300 ${
                  course.hasApplied ? 'border-blue-500' : 'border-green-600 hover:border-green-500'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {course.name}
                      </h3>
                      <p className={`text-sm font-medium ${
                        course.hasApplied ? 'text-blue-400' : 'text-green-400'
                      }`}>
                        {course.hasApplied ? 'Application Submitted ✓' : 'You Have the Required Subjects!'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                        course.hasApplied ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                      }`}>
                        {course.hasApplied ? 'Applied' : 'Qualified'}
                      </span>
                      {course.hasApplied && (
                        <span className="text-xs text-blue-300">
                          Status: Pending
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="font-medium w-24">Institution:</span>
                      <span className="text-blue-300 font-medium">{course.institutionName}</span>
                    </div>
                    
                    {course.institutionLocation && (
                      <div className="flex items-center text-sm text-gray-300">
                        <span className="font-medium w-24">Location:</span>
                        <span>{course.institutionLocation}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="font-medium w-24">Duration:</span>
                      <span>{course.duration || '3 years'}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-300">
                      <span className="font-medium w-24">Fees:</span>
                      <span className="text-orange-300 font-medium">M{course.fees?.toLocaleString() || 'Contact institution'}</span>
                    </div>

                    {course.requirements && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-300">Required Subjects:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {course.requirements.map((req, index) => {
                            const hasSubject = transcript?.completedSubjects?.includes(req.trim());
                            
                            return (
                              <span 
                                key={index}
                                className={`px-2 py-1 rounded text-xs transition-all duration-300 ${
                                  hasSubject 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-600 text-gray-300'
                                }`}
                              >
                                {req} {hasSubject && '✓'}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {course.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                    <span className={`text-sm font-medium ${
                      course.hasApplied ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {course.hasApplied ? 'Application submitted' : 'You have all required subjects'}
                    </span>
                    <button
                      onClick={() => handleDirectApply(course)}
                      disabled={applyingCourse === course.id || course.hasApplied}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                        course.hasApplied 
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {course.hasApplied ? 'Applied ✓' : applyingCourse === course.id ? 'Applying...' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-white mb-2">No Qualified Courses Found</h3>
              <p className="text-gray-400 mb-4">
                Your current high school subjects don't meet the requirements for any available courses.
              </p>
              <div className="space-y-3">
                <Link
                  to="/student/apply"
                  className="btn-professional inline-block mx-2"
                >
                  View All Courses
                </Link>
                <Link
                  to="/student/dashboard"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 mx-2"
                >
                  Update Subjects
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="elegant-card p-6 mt-6 bg-gradient-to-r from-blue-900 to-blue-800 transition-all duration-300">
          <div className="flex items-start">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">How Qualification Works</h3>
              <p className="text-blue-200 text-sm">
                • Courses are matched based on the subjects you completed in high school<br/>
                • You need to have completed ALL required subjects for a course<br/>
                • Some courses may have additional requirements<br/>
                • Contact institutions directly for specific entry queries
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualifiedCourses;