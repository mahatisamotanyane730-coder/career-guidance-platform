// src/components/admin/SystemReports.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

const SystemReports = () => {
  const [reports, setReports] = useState({
    userReports: [],
    applicationReports: [],
    jobReports: []
  });
  const [selectedReport, setSelectedReport] = useState('users');
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      
      const [usersSnapshot, applicationsSnapshot, jobsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'applications')),
        getDocs(collection(db, 'jobs'))
      ]);

      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const applications = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const userReports = generateUserReports(users);
      const applicationReports = generateApplicationReports(applications);
      const jobReports = generateJobReports(jobs);

      setReports({
        userReports,
        applicationReports,
        jobReports
      });

    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateUserReports = (users) => {
    const userTypes = ['student', 'institution', 'company', 'admin'];
    
    return userTypes.map(type => {
      const count = users.filter(user => user.userType === type).length;
      const percentage = ((count / users.length) * 100).toFixed(1);
      
      return {
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count,
        percentage: `${percentage}%`,
        trend: count > 0 ? 'positive' : 'neutral'
      };
    });
  };

  const generateApplicationReports = (applications) => {
    const statuses = ['pending', 'approved', 'rejected'];
    
    return statuses.map(status => {
      const count = applications.filter(app => app.status === status).length;
      const percentage = applications.length > 0 ? ((count / applications.length) * 100).toFixed(1) : 0;
      
      return {
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        percentage: `${percentage}%`,
        trend: status === 'approved' ? 'positive' : status === 'rejected' ? 'negative' : 'neutral'
      };
    });
  };

  const generateJobReports = (jobs) => {
    const statuses = ['active', 'filled', 'expired'];
    
    return statuses.map(status => {
      const count = jobs.filter(job => job.status === status).length;
      const percentage = jobs.length > 0 ? ((count / jobs.length) * 100).toFixed(1) : 0;
      
      return {
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        percentage: `${percentage}%`,
        trend: status === 'active' ? 'positive' : status === 'filled' ? 'neutral' : 'negative'
      };
    });
  };

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0]).join(',');
    const csvData = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${csvData}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'positive': return '↗';
      case 'negative': return '↘';
      default: return '→';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading reports...</div>
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
                to="/admin/dashboard"
                className="text-blue-300 hover:text-orange-400 flex items-center"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">System Reports</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {user?.firstName || 'Admin'}</span>
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
          {/* Report Type Selector */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedReport('users')}
                className={`px-4 py-2 rounded-md ${
                  selectedReport === 'users' 
                    ? 'btn-professional' 
                    : 'border border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                User Reports
              </button>
              <button
                onClick={() => setSelectedReport('applications')}
                className={`px-4 py-2 rounded-md ${
                  selectedReport === 'applications' 
                    ? 'btn-professional' 
                    : 'border border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Application Reports
              </button>
              <button
                onClick={() => setSelectedReport('jobs')}
                className={`px-4 py-2 rounded-md ${
                  selectedReport === 'jobs' 
                    ? 'btn-professional' 
                    : 'border border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Job Reports
              </button>
            </div>
          </div>

          {/* Export Button */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => exportToCSV(
                selectedReport === 'users' ? reports.userReports :
                selectedReport === 'applications' ? reports.applicationReports :
                reports.jobReports,
                `${selectedReport}_report`
              )}
              className="btn-professional"
            >
              Export to CSV
            </button>
          </div>

          {/* Reports Display */}
          <div className="elegant-card p-6">
            <div className="elegant-table">
              <table className="min-w-full">
                <thead>
                  <tr>
                    {selectedReport === 'users' && (
                      <>
                        <th className="text-left p-4">User Type</th>
                        <th className="text-left p-4">Count</th>
                        <th className="text-left p-4">Percentage</th>
                        <th className="text-left p-4">Trend</th>
                      </>
                    )}
                    {selectedReport === 'applications' && (
                      <>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Count</th>
                        <th className="text-left p-4">Percentage</th>
                        <th className="text-left p-4">Trend</th>
                      </>
                    )}
                    {selectedReport === 'jobs' && (
                      <>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Count</th>
                        <th className="text-left p-4">Percentage</th>
                        <th className="text-left p-4">Trend</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(selectedReport === 'users' ? reports.userReports :
                    selectedReport === 'applications' ? reports.applicationReports :
                    reports.jobReports).map((report, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="p-4 text-sm font-medium text-white">
                        {report.type || report.status}
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {report.count}
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {report.percentage}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center text-sm font-semibold ${getTrendColor(report.trend)}`}>
                          {getTrendIcon(report.trend)} {report.trend}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="elegant-card stat-card-primary p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-400">
                {reports.userReports.reduce((sum, report) => sum + report.count, 0)}
              </p>
            </div>
            <div className="elegant-card stat-card-success p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Total Applications</h3>
              <p className="text-3xl font-bold text-orange-400">
                {reports.applicationReports.reduce((sum, report) => sum + report.count, 0)}
              </p>
            </div>
            <div className="elegant-card stat-card-purple p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Total Jobs</h3>
              <p className="text-3xl font-bold text-blue-400">
                {reports.jobReports.reduce((sum, report) => sum + report.count, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemReports;