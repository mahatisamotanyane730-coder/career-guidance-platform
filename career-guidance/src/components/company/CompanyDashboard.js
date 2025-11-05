// src/components/company/CompanyDashboard.js
import React, { useState, useEffect } from 'react';
import { companyService } from '../../services/companyService';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const CompanyDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const result = await companyService.getDashboard();
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Error fetching company dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading Corporate Dashboard...</div>
      </div>
    );
  }

  const { company, jobs, applications, stats } = dashboardData || {};

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500 text-black', label: 'New' },
      reviewed: { color: 'bg-blue-500 text-white', label: 'In Review' },
      accepted: { color: 'bg-orange-500 text-black', label: 'Accepted' },
      rejected: { color: 'bg-red-500 text-white', label: 'Not Selected' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`status-badge ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* BLACK HEADER */}
      <header className="professional-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-white">Corporate Portal</h1>
              <nav className="hidden md:flex space-x-6">
                <Link to="/company/jobs" className="nav-item text-blue-300 hover:text-orange-400 text-sm font-medium">
                  Positions
                </Link>
                <Link to="/company/applications" className="nav-item text-blue-300 hover:text-orange-400 text-sm font-medium">
                  Candidates
                </Link>
                <Link to="/company/profile" className="nav-item text-blue-300 hover:text-orange-400 text-sm font-medium">
                  Company Profile
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{company?.companyName || user?.firstName || 'Corporate Partner'}</p>
                <p className="text-xs text-orange-400">Recruitment Portal</p>
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
            Talent Acquisition Dashboard
          </h1>
          <p className="text-gray-300 max-w-2xl">
            Manage your recruitment initiatives for {company?.companyName || 'your organization'}.
          </p>
        </div>

        {/* RECRUITMENT METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="elegant-card stat-card-primary p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Active Positions</h3>
              <span className="text-2xl font-bold text-blue-400">{stats?.openJobs || 0}</span>
            </div>
            <p className="text-sm text-gray-400">Currently recruiting positions</p>
          </div>

          <div className="elegant-card stat-card-warning p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">New Applications</h3>
              <span className="text-2xl font-bold text-yellow-400">{stats?.pendingApplications || 0}</span>
            </div>
            <p className="text-sm text-gray-400">Applications awaiting review</p>
          </div>

          <div className="elegant-card stat-card-success p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Total Applications</h3>
              <span className="text-2xl font-bold text-orange-400">{stats?.totalApplications || 0}</span>
            </div>
            <p className="text-sm text-gray-400">All candidate applications</p>
          </div>
        </div>

        {/* RECRUITMENT ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/company/jobs/new"
            className="elegant-card action-card-blue p-6 cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-3">Create Position</h3>
            <p className="text-blue-100 text-sm mb-4">
              Post new career opportunities and reach qualified candidates.
            </p>
            <div className="flex justify-between items-center text-sm">
              <span>Post New Role</span>
              <span>→</span>
            </div>
          </Link>
          
          <Link
            to="/company/applications"
            className="elegant-card action-card-orange p-6 cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-3">Review Candidates</h3>
            <p className="text-orange-900 text-sm mb-4">
              Evaluate applicant profiles and manage recruitment pipeline.
            </p>
            <div className="flex justify-between items-center text-sm">
              <span>View Applications</span>
              <span>→</span>
            </div>
          </Link>
          
          <Link
            to="/company/profile"
            className="elegant-card action-card-dark p-6 cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-3">Company Profile</h3>
            <p className="text-gray-300 text-sm mb-4">
              Update organizational information and recruitment preferences.
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
              <Link 
                to="/company/applications" 
                className="text-blue-400 hover:text-orange-400 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {applications && applications.length > 0 ? (
              <div className="space-y-4">
                {applications.slice(0, 4).map((application) => (
                  <div key={application.id} className="border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-white text-lg mb-1">
                          {application.studentName}
                        </h3>
                        <p className="text-gray-400 text-sm">{application.jobTitle}</p>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{application.studentEmail}</span>
                      <span>{new Date(application.appliedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Applications Received</h3>
                <p className="text-gray-500">Candidate applications will appear here once you post positions.</p>
              </div>
            )}
          </div>

          {/* ACTIVE POSITIONS */}
          <div className="elegant-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Active Positions</h2>
              <Link 
                to="/company/jobs" 
                className="text-blue-400 hover:text-orange-400 text-sm font-medium"
              >
                Manage All
              </Link>
            </div>
            
            {jobs && jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.slice(0, 4).map((job) => (
                  <div key={job.id} className="border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-white text-lg mb-1">{job.title}</h3>
                        <p className="text-gray-400 text-sm">{job.department || 'General'}</p>
                      </div>
                      <span className={`status-badge ${
                        job.status === 'open' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {job.status === 'open' ? 'Active' : 'Closed'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{job.location}</span>
                      <span>{job.applicationsCount || 0} applicants</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Active Positions</h3>
                <p className="text-gray-500 mb-4">Create your first job posting to start receiving applications.</p>
                <Link
                  to="/company/jobs/new"
                  className="btn-professional inline-block"
                >
                  Post New Position
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;