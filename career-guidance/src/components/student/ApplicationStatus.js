// src/components/student/ApplicationStatus.js
import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const ApplicationStatus = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const response = await studentService.getStudentApplications(user?.uid);
        if (response.success) {
          setApplications(response.data);
        }
      } catch (error) {
        console.error('Error loading applications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      loadApplications();
    }
  }, [user?.uid]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500 text-black', label: 'Pending' },
      approved: { color: 'bg-green-500 text-white', label: 'Approved' },
      rejected: { color: 'bg-red-500 text-white', label: 'Rejected' },
      admitted: { color: 'bg-orange-500 text-black', label: 'Admitted' },
      withdrawn: { color: 'bg-gray-500 text-white', label: 'Withdrawn' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`status-badge ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading your applications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/dashboard" className="text-blue-400 hover:text-orange-400 flex items-center">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">My Course Applications</h1>
        <p className="text-gray-300 mb-8">Track the status of all your course applications</p>

        {applications.length === 0 ? (
          <div className="elegant-card p-8 text-center">
            <div className="text-gray-400 mx-auto mb-4 text-4xl">📚</div>
            <h3 className="text-lg font-medium text-white mb-2">No applications yet</h3>
            <p className="text-gray-400 mb-4">You haven't applied to any courses yet.</p>
            <Link
              to="/student/apply"
              className="btn-professional inline-block"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="elegant-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">All Applications ({applications.length})</h2>
            </div>
            <div className="divide-y divide-gray-700">
              {applications.map((application) => (
                <div key={application.id} className="p-6 hover:bg-gray-800 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-white">
                          {application.courseName || 'Course Application'}
                        </h3>
                        {getStatusBadge(application.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300 mb-3">
                        <div>
                          <p><strong>Institution:</strong> {application.institutionName || 'Not specified'}</p>
                          <p><strong>Application Date:</strong> {new Date(application.applicationDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p><strong>Student:</strong> {application.studentName || 'Not specified'}</p>
                          <p><strong>Email:</strong> {application.studentEmail || 'Not specified'}</p>
                        </div>
                      </div>

                      {application.status === 'pending' && (
                        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="text-yellow-400 mr-3 text-xl">⏳</div>
                            <div>
                              <h4 className="text-sm font-medium text-yellow-200">Application Under Review</h4>
                              <p className="text-sm text-yellow-300 mt-1">
                                Your application is being reviewed by the institution. You'll be notified when there's an update.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {application.status === 'approved' && (
                        <div className="bg-green-900 border border-green-700 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="text-green-400 mr-3 text-xl">✅</div>
                            <div>
                              <h4 className="text-sm font-medium text-green-200">Application Approved</h4>
                              <p className="text-sm text-green-300 mt-1">
                                Congratulations! Your application has been approved by the institution.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {application.status === 'admitted' && (
                        <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="text-blue-400 mr-3 text-xl">🎉</div>
                            <div>
                              <h4 className="text-sm font-medium text-blue-200">Admission Confirmed</h4>
                              <p className="text-sm text-blue-300 mt-1">
                                Congratulations! You have been officially admitted to this course.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {application.status === 'rejected' && (
                        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="text-red-400 mr-3 text-xl">❌</div>
                            <div>
                              <h4 className="text-sm font-medium text-red-200">Application Not Successful</h4>
                              <p className="text-sm text-red-300 mt-1">
                                Unfortunately, your application was not successful this time. You can apply to other courses.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationStatus;