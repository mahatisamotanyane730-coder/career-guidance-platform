// src/components/student/StudentDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const loadDashboardData = useCallback(async () => {
    try {
      const applicationsResponse = await studentService.getStudentApplications(user?.uid);
      const jobApplicationsResponse = await studentService.getStudentJobApplications(user?.uid);
      
      if (applicationsResponse.success) {
        const applications = applicationsResponse.data;
        const jobApplications = jobApplicationsResponse.success ? jobApplicationsResponse.data : [];
        
        const stats = {
          totalApplications: applications.length,
          pending: applications.filter(app => app.status === 'pending').length,
          approved: applications.filter(app => app.status === 'approved').length,
          rejected: applications.filter(app => app.status === 'rejected').length,
          admitted: applications.filter(app => app.status === 'admitted').length,
          totalJobApplications: jobApplications.length,
          jobPending: jobApplications.filter(app => app.status === 'pending').length,
          jobReviewed: jobApplications.filter(app => app.status === 'reviewed').length,
          jobAccepted: jobApplications.filter(app => app.status === 'accepted').length,
          jobRejected: jobApplications.filter(app => app.status === 'rejected').length
        };

        setDashboardData({
          stats,
          applications: applications.slice(0, 3),
          jobApplications: jobApplications.slice(0, 3)
        });
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
            jobRejected: 0
          },
          applications: [],
          jobApplications: []
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
          jobRejected: 0
        },
        applications: [],
        jobApplications: []
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500 text-black', label: 'Under Review' },
      approved: { color: 'bg-blue-500 text-white', label: 'Approved' },
      rejected: { color: 'bg-red-500 text-white', label: 'Not Accepted' },
      admitted: { color: 'bg-green-500 text-white', label: 'Admitted' },
      reviewed: { color: 'bg-purple-500 text-white', label: 'Under Consideration' },
      accepted: { color: 'bg-orange-500 text-black', label: 'Offer Extended' }
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
        <div className="text-white">Loading Student Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* BLACK HEADER */}
      <header className="professional-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-white">Student Portal</h1>
              <nav className="hidden md:flex space-x-6">
                <Link to="/student/apply" className="nav-item text-blue-300 hover:text-orange-400 text-sm font-medium">
                  Find Programs
                </Link>
                <Link to="/student/applications" className="nav-item text-blue-300 hover:text-orange-400 text-sm font-medium">
                  My Applications
                </Link>
                <Link to="/jobs" className="nav-item text-blue-300 hover:text-orange-400 text-sm font-medium">
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
                className="btn-orange px-4 py-2 rounded text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* WELCOME SECTION */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Academic Dashboard
          </h1>
          <p className="text-gray-300 max-w-2xl">
            Welcome back, {user?.firstName || 'Student'}. Track your academic applications and career development progress.
          </p>
        </div>

        {/* APPLICATION STATISTICS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="elegant-card stat-card-primary p-4">
            <div className="text-2xl font-bold text-blue-400 mb-1">{dashboardData?.stats?.totalApplications || 0}</div>
            <div className="text-sm font-semibold text-white">Total Applications</div>
          </div>
          <div className="elegant-card stat-card-warning p-4">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{dashboardData?.stats?.pending || 0}</div>
            <div className="text-sm font-semibold text-white">Pending</div>
          </div>
          <div className="elegant-card stat-card-success p-4">
            <div className="text-2xl font-bold text-orange-400 mb-1">{dashboardData?.stats?.approved || 0}</div>
            <div className="text-sm font-semibold text-white">Approved</div>
          </div>
          <div className="elegant-card stat-card-primary p-4">
            <div className="text-2xl font-bold text-blue-400 mb-1">{dashboardData?.stats?.admitted || 0}</div>
            <div className="text-sm font-semibold text-white">Admitted</div>
          </div>
          <div className="elegant-card stat-card-danger p-4">
            <div className="text-2xl font-bold text-red-400 mb-1">{dashboardData?.stats?.rejected || 0}</div>
            <div className="text-sm font-semibold text-white">Rejected</div>
          </div>
        </div>

        {/* QUICK ACCESS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/student/apply"
            className="elegant-card action-card-blue p-6 cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-3">Explore Academic Programs</h3>
            <p className="text-blue-100 text-sm mb-4">
              Discover and apply to undergraduate and graduate programs.
            </p>
            <div className="flex justify-between items-center text-sm">
              <span>Browse Programs</span>
              <span>→</span>
            </div>
          </Link>
          
          <Link
            to="/student/applications"
            className="elegant-card action-card-orange p-6 cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-3">Application Status</h3>
            <p className="text-orange-900 text-sm mb-4">
              Track the progress of your submitted applications.
            </p>
            <div className="flex justify-between items-center text-sm">
              <span>View Applications</span>
              <span>→</span>
            </div>
          </Link>
          
          <Link
            to="/jobs"
            className="elegant-card action-card-dark p-6 cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-3">Career Development</h3>
            <p className="text-gray-300 text-sm mb-4">
              Explore internship and employment opportunities.
            </p>
            <div className="flex justify-between items-center text-sm">
              <span>View Opportunities</span>
              <span>→</span>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* RECENT APPLICATIONS */}
          <div className="elegant-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
              <Link 
                to="/student/applications" 
                className="text-blue-400 hover:text-orange-400 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {dashboardData?.applications?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.applications.map((application) => (
                  <div key={application.id} className="border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
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
                  className="btn-professional inline-block"
                >
                  Explore Programs
                </Link>
              </div>
            )}
          </div>

          {/* CAREER APPLICATIONS */}
          <div className="elegant-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Career Applications</h2>
              <Link 
                to="/jobs" 
                className="text-blue-400 hover:text-orange-400 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {dashboardData?.jobApplications?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.jobApplications.map((application) => (
                  <div key={application.id} className="border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
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
                  to="/jobs"
                  className="btn-professional inline-block"
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