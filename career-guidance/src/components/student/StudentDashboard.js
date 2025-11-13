import React, { useState, useEffect, useCallback } from 'react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import TranscriptUpload from './TranscriptUpload';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasTranscript, setHasTranscript] = useState(false);
  const [showTranscriptUpload, setShowTranscriptUpload] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('edit') === 'transcript') {
      setShowTranscriptUpload(true);
    }
  }, [searchParams]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const loadDashboardData = useCallback(async () => {
    try {
      const dashboardResponse = await studentService.getDashboard(user?.uid);
      
      if (dashboardResponse.success) {
        const data = dashboardResponse.data;
        setDashboardData(data);
        setHasTranscript(data.stats?.hasTranscript || false);
      } else {
        setDashboardData({
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
          },
          applications: [],
          jobApplications: [],
          transcript: null
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setDashboardData({
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
        },
        applications: [],
        jobApplications: [],
        transcript: null
      });
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadDashboardData();
    }
  }, [loadDashboardData, user?.uid]);

  const handleTranscriptUploaded = () => {
    setHasTranscript(true);
    setShowTranscriptUpload(false);
    loadDashboardData();
  };

  const handleAcceptAdmission = async (applicationId) => {
    if (window.confirm('Are you sure you want to accept this admission offer? This will automatically decline all other offers.')) {
      try {
        const result = await studentService.acceptAdmission(applicationId);
        if (result.success) {
          alert(result.message);
          loadDashboardData();
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        alert('Error accepting admission: ' + error.message);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500 text-black', label: 'Under Review' },
      approved: { color: 'bg-blue-500 text-white', label: 'Approved' },
      rejected: { color: 'bg-red-500 text-white', label: 'Not Accepted' },
      admitted: { color: 'bg-green-500 text-white', label: 'Admitted' },
      accepted: { color: 'bg-purple-500 text-white', label: 'Accepted' },
      reviewed: { color: 'bg-purple-500 text-white', label: 'Under Consideration' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} transition-all duration-300`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading Student Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="professional-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-white">Student Portal</h1>
              <nav className="hidden md:flex space-x-6">
                <Link to="/student/apply" className="nav-item text-blue-300 hover:text-orange-400 text-sm font-medium transition-colors duration-300">
                  Find Programs
                </Link>
                <Link to="/student/applications" className="nav-item text-blue-300 hover:text-orange-400 text-sm font-medium transition-colors duration-300">
                  My Applications
                </Link>
                <Link to="/student/jobs" className="nav-item text-blue-300 hover:text-orange-400 text-sm font-medium transition-colors duration-300">
                  Career Opportunities
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.firstName || 'Student'}</p>
                <p className="text-xs text-orange-400">Academic Profile</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-orange px-4 py-2 rounded text-sm font-medium transition-colors duration-300"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Academic Dashboard
          </h1>
          <p className="text-gray-300 max-w-2xl">
            Welcome back, {user?.firstName || 'Student'}. Track your academic applications and career development progress.
          </p>
        </div>

        <div id="transcript-section">
          {(!hasTranscript || showTranscriptUpload) && (
            <TranscriptUpload 
              onTranscriptUploaded={handleTranscriptUploaded}
              onCancel={() => setShowTranscriptUpload(false)}
              existingTranscript={dashboardData?.transcript}
              editMode={showTranscriptUpload}
            />
          )}
        </div>

        {hasTranscript && !showTranscriptUpload && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Qualified Courses CTA */}
            <div className="elegant-card p-6 bg-gradient-to-r from-green-900 to-blue-900 border border-green-700 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">See Your Qualified Courses</h3>
                  <p className="text-green-200 text-sm">
                    Based on your transcript, view courses that automatically match your qualifications.
                  </p>
                </div>
                <Link
                  to="/student/qualified-courses"
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-md font-medium transition-colors duration-300 flex items-center"
                >
                  View Courses
                </Link>
              </div>
            </div>

            {/* Qualified Jobs CTA */}
            <div className="elegant-card p-6 bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-700 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2"> Find Matching Jobs</h3>
                  <p className="text-purple-200 text-sm">
                    Discover job opportunities that match your high school qualifications.
                  </p>
                </div>
                <Link
                  to="/student/jobs"
                  className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-md font-medium transition-colors duration-300 flex items-center"
                >
                  View Jobs
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* APPLICATION STATISTICS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="elegant-card stat-card-primary p-4 transition-all duration-300">
            <div className="text-2xl font-bold text-blue-400 mb-1">{dashboardData?.stats?.totalApplications || 0}</div>
            <div className="text-sm font-semibold text-white">Total Applications</div>
          </div>
          <div className="elegant-card stat-card-warning p-4 transition-all duration-300">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{dashboardData?.stats?.pending || 0}</div>
            <div className="text-sm font-semibold text-white">Pending</div>
          </div>
          <div className="elegant-card stat-card-success p-4 transition-all duration-300">
            <div className="text-2xl font-bold text-orange-400 mb-1">{dashboardData?.stats?.approved || 0}</div>
            <div className="text-sm font-semibold text-white">Approved</div>
          </div>
          <div className="elegant-card stat-card-primary p-4 transition-all duration-300">
            <div className="text-2xl font-bold text-blue-400 mb-1">{dashboardData?.stats?.admitted || 0}</div>
            <div className="text-sm font-semibold text-white">Admitted</div>
          </div>
          <div className="elegant-card stat-card-danger p-4 transition-all duration-300">
            <div className="text-2xl font-bold text-red-400 mb-1">{dashboardData?.stats?.rejected || 0}</div>
            <div className="text-sm font-semibold text-white">Rejected</div>
          </div>
        </div>

        {/* QUICK ACCESS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to={hasTranscript ? "/student/qualified-courses" : "/student/apply"}
            className="elegant-card action-card-blue p-6 cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <h3 className="text-xl font-semibold mb-3 text-white">
              {hasTranscript ? 'Qualified Programs' : 'Explore Academic Programs'}
            </h3>
            <p className="text-blue-100 text-sm mb-4">
              {hasTranscript 
                ? 'Browse courses that match your qualifications automatically.' 
                : 'Discover and apply to undergraduate and graduate programs.'}
            </p>
            <div className="flex justify-between items-center text-sm text-blue-300">
              <span>{hasTranscript ? 'View Matches' : 'Browse Programs'}</span>
              <span>→</span>
            </div>
          </Link>
          
          <Link
            to="/student/applications"
            className="elegant-card action-card-orange p-6 cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <h3 className="text-xl font-semibold mb-3 text-white">Application Status</h3>
            <p className="text-orange-100 text-sm mb-4">
              Track the progress of your submitted applications.
            </p>
            <div className="flex justify-between items-center text-sm text-orange-300">
              <span>View Applications</span>
              <span>→</span>
            </div>
          </Link>
          
          <Link
            to="/student/jobs"
            className="elegant-card action-card-dark p-6 cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <h3 className="text-xl font-semibold mb-3 text-white">Career Opportunities</h3>
            <p className="text-gray-300 text-sm mb-4">
              Find jobs that match your qualifications automatically.
            </p>
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>View Opportunities</span>
              <span>→</span>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* RECENT APPLICATIONS */}
          <div className="elegant-card p-6 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
              <Link 
                to="/student/applications" 
                className="text-blue-400 hover:text-orange-400 text-sm font-medium transition-colors duration-300"
              >
                View All
              </Link>
            </div>
            
            {dashboardData?.applications?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.applications.map((application) => (
                  <div key={application.id} className="border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-white text-lg mb-1">
                          {application.courseName || 'Academic Program'}
                        </h3>
                        <p className="text-gray-400 text-sm">{application.institutionName}</p>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Applied: {new Date(application.applicationDate).toLocaleDateString()}</span>
                      {application.status === 'admitted' && (
                        <button
                          onClick={() => handleAcceptAdmission(application.id)}
                          className="btn-professional text-xs py-1 px-2 transition-colors duration-300"
                        >
                          Accept Offer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Applications Submitted</h3>
                <p className="text-gray-500 mb-4">Begin your academic journey by exploring available programs.</p>
                <Link
                  to="/student/apply"
                  className="btn-professional inline-block transition-colors duration-300"
                >
                  Explore Programs
                </Link>
              </div>
            )}
          </div>

          {/* CAREER APPLICATIONS */}
          <div className="elegant-card p-6 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Career Applications</h2>
              <Link 
                to="/student/jobs" 
                className="text-blue-400 hover:text-orange-400 text-sm font-medium transition-colors duration-300"
              >
                View All
              </Link>
            </div>
            
            {dashboardData?.jobApplications?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.jobApplications.map((application) => (
                  <div key={application.id} className="border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-white text-lg mb-1">
                          {application.job?.title || 'Professional Position'}
                        </h3>
                        <p className="text-gray-400 text-sm">{application.job?.company?.companyName}</p>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Career Applications</h3>
                <p className="text-gray-500 mb-4">Explore professional opportunities with our partner organizations.</p>
                <Link
                  to="/student/jobs"
                  className="btn-professional inline-block transition-colors duration-300"
                >
                  View Opportunities
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;