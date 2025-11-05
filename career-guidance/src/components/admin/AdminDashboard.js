// src/components/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalInstitutions: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalApplications: 0,
    pendingApprovals: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const jobsSnapshot = await getDocs(collection(db, 'jobs'));
      const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const applicationsSnapshot = await getDocs(collection(db, 'applications'));
      const applications = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const jobApplicationsSnapshot = await getDocs(collection(db, 'jobApplications'));
      const jobApplications = jobApplicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const totalUsers = users.length;
      const totalStudents = users.filter(user => user.userType === 'student').length;
      const totalInstitutions = users.filter(user => user.userType === 'institution').length;
      const totalCompanies = users.filter(user => user.userType === 'company').length;
      const totalJobs = jobs.length;
      const totalApplications = applications.length + jobApplications.length;
      
      const pendingApprovals = users.filter(user => 
        (user.userType === 'institution' || user.userType === 'company') && 
        user.status === 'pending'
      ).length;

      setStats({
        totalUsers,
        totalStudents,
        totalInstitutions,
        totalCompanies,
        totalJobs,
        totalApplications,
        pendingApprovals
      });

      const recentUsers = users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(user => ({
          type: 'user_registration',
          message: `${user.firstName} ${user.lastName} registered as ${user.userType}`,
          timestamp: user.createdAt,
          status: 'completed'
        }));

      setRecentActivity(recentUsers);

    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading Administrative Dashboard...</div>
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
              <h1 className="text-xl font-bold text-white">Administrative Console</h1>
              <nav className="hidden md:flex space-x-6">
                <button onClick={() => navigate('/admin/users')} className="nav-item text-blue-300 hover:text-orange-400 text-sm font-medium">
                  User Management
                </button>
                <button onClick={() => navigate('/admin/institutions')} className="nav-item text-blue-300 hover:text-orange-400 text-sm font-medium">
                  Institutions
                </button>
                <button onClick={() => navigate('/admin/companies')} className="nav-item text-blue-300 hover:text-orange-400 text-sm font-medium">
                  Companies
                </button>
                <button onClick={() => navigate('/admin/analytics')} className="nav-item text-blue-300 hover:text-orange-400 text-sm font-medium">
                  Analytics
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.firstName || 'Administrator'}</p>
                <p className="text-xs text-orange-400">System Administrator</p>
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
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">System Administration</h1>
              <p className="text-gray-300 max-w-3xl">
                Comprehensive oversight and management of the Career Guidance Platform.
              </p>
            </div>
            <div className="metric-highlight">
              <div className="text-2xl font-bold mb-1">99.9%</div>
              <div className="text-sm">System Uptime</div>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="elegant-card stat-card-primary p-4">
            <div className="text-2xl font-bold text-blue-400 mb-1">{stats.totalUsers}</div>
            <div className="text-sm font-semibold text-white">Total Users</div>
            <div className="text-xs text-gray-400 mt-1">All Platform Users</div>
          </div>
          
          <div className="elegant-card stat-card-success p-4">
            <div className="text-2xl font-bold text-orange-400 mb-1">{stats.totalStudents}</div>
            <div className="text-sm font-semibold text-white">Students</div>
            <div className="text-xs text-gray-400 mt-1">Active Learners</div>
          </div>
          
          <div className="elegant-card stat-card-primary p-4">
            <div className="text-2xl font-bold text-blue-400 mb-1">{stats.totalInstitutions}</div>
            <div className="text-sm font-semibold text-white">Institutions</div>
            <div className="text-xs text-gray-400 mt-1">Education Partners</div>
          </div>
          
          <div className="elegant-card stat-card-purple p-4">
            <div className="text-2xl font-bold text-blue-300 mb-1">{stats.totalCompanies}</div>
            <div className="text-sm font-semibold text-white">Companies</div>
            <div className="text-xs text-gray-400 mt-1">Corporate Partners</div>
          </div>
          
          <div className="elegant-card stat-card-warning p-4">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.totalJobs}</div>
            <div className="text-sm font-semibold text-white">Job Postings</div>
            <div className="text-xs text-gray-400 mt-1">Active Positions</div>
          </div>
          
          <div className="elegant-card stat-card-primary p-4">
            <div className="text-2xl font-bold text-blue-400 mb-1">{stats.totalApplications}</div>
            <div className="text-sm font-semibold text-white">Applications</div>
            <div className="text-xs text-gray-400 mt-1">Total Submissions</div>
          </div>
          
          <div className="elegant-card stat-card-danger p-4">
            <div className="text-2xl font-bold text-red-400 mb-1">{stats.pendingApprovals}</div>
            <div className="text-sm font-semibold text-white">Pending</div>
            <div className="text-xs text-gray-400 mt-1">Approvals Required</div>
          </div>
        </div>

        {/* SYSTEM OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="elegant-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Database</span>
                <span className="text-sm font-medium text-green-400">Healthy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">File Storage</span>
                <span className="text-sm font-medium text-green-400">Healthy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Performance</span>
                <span className="text-sm font-medium text-green-400">Optimal</span>
              </div>
            </div>
          </div>

          <div className="elegant-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/admin/users')}
                className="w-full text-left p-3 rounded border border-gray-600 hover:border-blue-500 transition-colors"
              >
                <div className="font-medium text-white">User Management</div>
                <div className="text-sm text-gray-400">Manage all platform users</div>
              </button>
              <button 
                onClick={() => navigate('/admin/analytics')}
                className="w-full text-left p-3 rounded border border-gray-600 hover:border-blue-500 transition-colors"
              >
                <div className="font-medium text-white">Platform Analytics</div>
                <div className="text-sm text-gray-400">View usage statistics</div>
              </button>
            </div>
          </div>

          <div className="elegant-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Storage Usage</h3>
            <div className="text-center py-4">
              <div className="text-2xl font-bold text-white mb-1">78%</div>
              <div className="text-sm text-gray-400">Storage Utilized</div>
              <div className="progress-bar mt-2">
                <div className="progress-fill progress-blue" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* MANAGEMENT SECTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div 
            className="elegant-card action-card-blue p-6 cursor-pointer"
            onClick={() => navigate('/admin/users')}
          >
            <h3 className="text-xl font-semibold mb-3">User Management</h3>
            <p className="text-blue-100 text-sm mb-4">
              Comprehensive oversight of all platform users.
            </p>
            <div className="flex justify-between items-center text-sm">
              <span>View User Directory</span>
              <span>→</span>
            </div>
          </div>
          
          <div 
            className="elegant-card action-card-orange p-6 cursor-pointer"
            onClick={() => navigate('/admin/institutions')}
          >
            <h3 className="text-xl font-semibold mb-3">Institution Oversight</h3>
            <p className="text-orange-900 text-sm mb-4">
              Manage educational institutions and programs.
            </p>
            <div className="flex justify-between items-center text-sm">
              <span>Manage Institutions</span>
              <span>→</span>
            </div>
          </div>
          
          <div 
            className="elegant-card action-card-dark p-6 cursor-pointer"
            onClick={() => navigate('/admin/companies')}
          >
            <h3 className="text-xl font-semibold mb-3">Corporate Partners</h3>
            <p className="text-gray-300 text-sm mb-4">
              Oversee company registrations and job postings.
            </p>
            <div className="flex justify-between items-center text-sm">
              <span>Review Companies</span>
              <span>→</span>
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="elegant-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Platform Activity</h2>
            <button 
              onClick={fetchDashboardData}
              className="text-blue-400 hover:text-orange-400 text-sm font-medium"
            >
              Refresh Data
            </button>
          </div>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <div>
                      <p className="font-medium text-white">{activity.message}</p>
                      <p className="text-sm text-gray-400">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-400 bg-gray-800 px-2 py-1 rounded">
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-300 mb-2">No recent activity</h3>
              <p className="text-gray-500">Platform activity will appear here as users interact with the system.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;