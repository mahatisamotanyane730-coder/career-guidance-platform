// src/components/institution/AdmissionsPanel.js
import React, { useState, useEffect, useCallback } from 'react';
import { institutionService } from '../../services/institutionService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const AdmissionsPanel = () => {
  const [applications, setApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const institutionResult = await institutionService.getInstitutionByUserId(user.uid);
      if (!institutionResult.success) {
        setError('Institution not found');
        return;
      }

      const institution = institutionResult.data;
      
      // Fetch applications and courses in parallel
      const [applicationsResult, coursesResult] = await Promise.all([
        institutionService.getInstitutionApplications(institution.id),
        institutionService.getInstitutionCourses(institution.id)
      ]);

      if (applicationsResult.success) {
        setApplications(applicationsResult.data);
      } else {
        setError(applicationsResult.message);
      }

      if (coursesResult.success) {
        setCourses(coursesResult.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load admissions data');
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      setUpdating(applicationId);
      setError('');
      
      const result = await institutionService.updateApplicationStatus(applicationId, newStatus);
      
      if (result.success) {
        // Update local state
        setApplications(prev => prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        ));
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Failed to update application');
    } finally {
      setUpdating(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredApplications = applications.filter(app => {
    const courseMatch = selectedCourse === 'all' || app.courseId === selectedCourse;
    const statusMatch = selectedStatus === 'all' || app.status === selectedStatus;
    return courseMatch && statusMatch;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500 text-black', label: 'Under Review' },
      approved: { color: 'bg-blue-500 text-white', label: 'Approved' },
      rejected: { color: 'bg-red-500 text-white', label: 'Not Accepted' },
      admitted: { color: 'bg-orange-500 text-black', label: 'Admitted' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`status-badge ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusCount = (status) => {
    return applications.filter(app => app.status === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading admissions panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* BLACK HEADER */}
      <header className="professional-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/institution/dashboard"
                className="text-blue-300 hover:text-orange-400 flex items-center"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">Admissions Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {user?.institutionName || user?.firstName}</span>
              <button
                onClick={handleLogout}
                className="btn-orange px-4 py-2 rounded text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="elegant-card border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-400">Error</h3>
                  <div className="mt-1 text-sm text-red-300">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="elegant-card stat-card-primary p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Total Applications</h3>
                <span className="text-2xl font-bold text-blue-400">{applications.length}</span>
              </div>
              <p className="text-sm text-gray-400">All applications</p>
            </div>
            <div className="elegant-card stat-card-warning p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Pending Review</h3>
                <span className="text-2xl font-bold text-yellow-400">{getStatusCount('pending')}</span>
              </div>
              <p className="text-sm text-gray-400">Requiring action</p>
            </div>
            <div className="elegant-card stat-card-success p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Approved</h3>
                <span className="text-2xl font-bold text-orange-400">{getStatusCount('approved')}</span>
              </div>
              <p className="text-sm text-gray-400">Accepted applications</p>
            </div>
            <div className="elegant-card stat-card-danger p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Rejected</h3>
                <span className="text-2xl font-bold text-red-400">{getStatusCount('rejected')}</span>
              </div>
              <p className="text-sm text-gray-400">Not accepted</p>
            </div>
          </div>

          {/* Filters */}
          <div className="elegant-card p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Filter Applications</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="professional-input"
                >
                  <option value="all">All Courses</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="professional-input"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchData}
                  className="btn-professional w-full"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="elegant-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Student Applications</h2>
            
            {filteredApplications.length > 0 ? (
              <div className="space-y-6">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-white">
                            {application.studentName}
                          </h3>
                          {getStatusBadge(application.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-400">
                              <strong className="text-white">Course:</strong> {application.courseName}
                            </p>
                            <p className="text-sm text-gray-400">
                              <strong className="text-white">Email:</strong> {application.studentEmail}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">
                              <strong className="text-white">Applied:</strong> {new Date(application.applicationDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-400">
                              <strong className="text-white">Phone:</strong> {application.studentPhone || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">
                              <strong className="text-white">Location:</strong> {application.studentLocation || 'Not specified'}
                            </p>
                          </div>
                        </div>

                        {application.studentMessage && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-sm text-white mb-2">Student Message:</h4>
                            <p className="text-gray-300 text-sm bg-gray-800 p-3 rounded">
                              {application.studentMessage}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {application.status === 'pending' && (
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleUpdateStatus(application.id, 'approved')}
                              disabled={updating === application.id}
                              className="btn-professional flex items-center"
                            >
                              {updating === application.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Approving...
                                </>
                              ) : (
                                'Approve Application'
                              )}
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(application.id, 'rejected')}
                              disabled={updating === application.id}
                              className="btn-orange"
                            >
                              Reject Application
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No applications found</h3>
                <p className="text-gray-400">
                  {selectedCourse !== 'all' || selectedStatus !== 'all'
                    ? 'No applications match your current filters.'
                    : 'No students have applied to your institution yet.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsPanel;