// src/components/institution/InstitutionDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { institutionService } from '../../services/institutionService';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const InstitutionDashboard = () => {
  const [institutions, setInstitutions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const institutionsResponse = await institutionService.getAllInstitutions();
      const applicationsResponse = await institutionService.getAllApplications();
      const allCourses = [];
      
      if (institutionsResponse.success && institutionsResponse.data) {
        for (const institution of institutionsResponse.data) {
          const coursesResponse = await institutionService.getCoursesByInstitution(institution.id);
          if (coursesResponse.success && coursesResponse.data) {
            allCourses.push(...coursesResponse.data.map(course => ({
              ...course,
              institutionName: institution.name
            })));
          }
        }
      }

      setInstitutions(institutionsResponse.success ? institutionsResponse.data : []);
      setApplications(applicationsResponse.success ? applicationsResponse.data : []);
      setCourses(allCourses);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Calculate statistics
  const stats = {
    totalInstitutions: institutions.length,
    totalApplications: applications.length,
    totalCourses: courses.length,
    pendingApplications: applications.filter(app => app.status === 'pending').length,
    approvedApplications: applications.filter(app => app.status === 'approved').length,
    rejectedApplications: applications.filter(app => app.status === 'rejected').length,
    admittedApplications: applications.filter(app => app.status === 'admitted').length
  };

  // Get recent applications
  const recentApplications = applications
    .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate))
    .slice(0, 5);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading Institutional Dashboard...</div>
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
              <h1 className="text-xl font-bold text-white">Institutional Portal</h1>
              <nav className="hidden md:flex space-x-6">
                <Link to="/institution/applications" className="nav-item text-blue-300 hover:text-orange-400 text-sm font-medium">
                  Applications
                </Link>
                <Link to="/institution/courses" className="nav-item text-blue-300 hover:text-orange-400 text-sm font-medium">
                  Programs
                </Link>
                <Link to="/institution/faculties" className="nav-item text-blue-300 hover:text-orange-400 text-sm font-medium">
                  Departments
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.firstName || user?.name || 'Administrator'}</p>
                <p className="text-xs text-orange-400">Institutional Admin</p>
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
          <h1 className="text-3xl font-bold text-white mb-2">Academic Administration</h1>
          <p className="text-gray-300 max-w-3xl">
            Comprehensive management of institutional programs and student applications.
          </p>
        </div>

        {/* INSTITUTIONAL OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="elegant-card stat-card-primary p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Partner Institutions</h3>
              <span className="text-2xl font-bold text-blue-400">{stats.totalInstitutions}</span>
            </div>
            <p className="text-sm text-gray-400">Educational institutions</p>
          </div>

          <div className="elegant-card stat-card-success p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Academic Programs</h3>
              <span className="text-2xl font-bold text-orange-400">{stats.totalCourses}</span>
            </div>
            <p className="text-sm text-gray-400">Available courses</p>
          </div>

          <div className="elegant-card stat-card-primary p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Total Applications</h3>
              <span className="text-2xl font-bold text-blue-400">{stats.totalApplications}</span>
            </div>
            <p className="text-sm text-gray-400">Student applications</p>
          </div>

          <div className="elegant-card stat-card-warning p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Requiring Review</h3>
              <span className="text-2xl font-bold text-yellow-400">{stats.pendingApplications}</span>
            </div>
            <p className="text-sm text-gray-400">Pending decisions</p>
          </div>
        </div>

        {/* APPLICATION STATUS */}
        <div className="elegant-card p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Application Status Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-yellow-400">{stats.pendingApplications}</div>
              <div className="text-sm text-gray-400 mt-1">Under Review</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-blue-400">{stats.approvedApplications}</div>
              <div className="text-sm text-gray-400 mt-1">Approved</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-orange-400">{stats.admittedApplications}</div>
              <div className="text-sm text-gray-400 mt-1">Admitted</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-red-400">{stats.rejectedApplications}</div>
              <div className="text-sm text-gray-400 mt-1">Not Accepted</div>
            </div>
          </div>
        </div>

        {/* MANAGEMENT ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/institution/applications"
            className="elegant-card action-card-blue p-6 cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-3">Application Review</h3>
            <p className="text-blue-100 text-sm mb-4">
              Evaluate and process student applications.
            </p>
            <div className="flex justify-between items-center text-sm">
              <span>Review Applications</span>
              <span>→</span>
            </div>
          </Link>
          
          <Link
            to="/institution/courses"
            className="elegant-card action-card-orange p-6 cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-3">Program Management</h3>
            <p className="text-orange-900 text-sm mb-4">
              Oversee academic programs and curriculum.
            </p>
            <div className="flex justify-between items-center text-sm">
              <span>Manage Programs</span>
              <span>→</span>
            </div>
          </Link>
          
          <Link
            to="/institution/faculties"
            className="elegant-card action-card-dark p-6 cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-3">Department Oversight</h3>
            <p className="text-gray-300 text-sm mb-4">
              Manage academic departments and structure.
            </p>
            <div className="flex justify-between items-center text-sm">
              <span>View Departments</span>
              <span>→</span>
            </div>
          </Link>
          
          <Link
            to="/institution/profile"
            className="elegant-card action-card-dark p-6 cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-3">Institutional Profile</h3>
            <p className="text-gray-300 text-sm mb-4">
              Update institutional details and offerings.
            </p>
            <div className="flex justify-between items-center text-sm">
              <span>Update Profile</span>
              <span>→</span>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* RECENT APPLICATIONS */}
          <div className="elegant-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
              {recentApplications.length > 0 && (
                <Link 
                  to="/institution/applications" 
                  className="text-blue-400 hover:text-orange-400 text-sm font-medium"
                >
                  View All
                </Link>
              )}
            </div>
            
            {recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-white text-lg mb-1">
                          {application.studentName || 'Student'}
                        </h3>
                        <p className="text-gray-400 text-sm">{application.courseName || 'Academic Program'}</p>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <p><strong>Institution:</strong> {application.institutionName || 'Not specified'}</p>
                      <p><strong>Applied:</strong> {new Date(application.applicationDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Applications Received</h3>
                <p className="text-gray-500">Student applications will appear here once they start applying.</p>
              </div>
            )}
          </div>

          {/* INSTITUTIONS OVERVIEW */}
          <div className="elegant-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Partner Institutions</h2>
              <span className="text-sm text-gray-400">{institutions.length} institutions</span>
            </div>
            
            {institutions.length > 0 ? (
              <div className="space-y-4">
                {institutions.slice(0, 4).map((institution) => {
                  const institutionCourses = courses.filter(course => course.institutionId === institution.id);
                  const institutionApplications = applications.filter(app => app.institutionId === institution.id);
                  
                  return (
                    <div key={institution.id} className="border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
                      <h3 className="font-semibold text-white text-lg mb-2">{institution.name}</h3>
                      
                      <div className="text-sm text-gray-400 space-y-1 mb-3">
                        <p><strong>Programs:</strong> {institutionCourses.length}</p>
                        <p><strong>Applications:</strong> {institutionApplications.length}</p>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">{institution.email || 'Contact not specified'}</span>
                        <Link
                          to={`/institution/applications?institution=${institution.id}`}
                          className="text-blue-400 hover:text-orange-400 font-medium"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Institutions Registered</h3>
                <p className="text-gray-500">Educational institutions will appear here once they join the platform.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDashboard;