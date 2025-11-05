// src/components/institution/StudentApplications.js
import React, { useState, useEffect, useCallback } from 'react';
import { institutionService } from '../../services/institutionService';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstitution, setSelectedInstitution] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { user } = useAuth();

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📋 Loading ALL applications for institution admin');

      // Load ALL applications (not filtered by institution)
      const applicationsResponse = await institutionService.getAllApplications();
      console.log('✅ All applications loaded:', applicationsResponse);

      // Load ALL institutions to show in filter
      const institutionsResponse = await institutionService.getAllInstitutions();
      console.log('🏛️ All institutions loaded:', institutionsResponse);

      if (applicationsResponse.success) {
        setApplications(applicationsResponse.data || []);
        setFilteredApplications(applicationsResponse.data || []);
      }

      if (institutionsResponse.success) {
        setInstitutions(institutionsResponse.data || []);
      }

    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Filter applications based on selected institution and status
  useEffect(() => {
    let filtered = applications;

    // Filter by institution
    if (selectedInstitution !== 'all') {
      filtered = filtered.filter(app => app.institutionId === selectedInstitution);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    setFilteredApplications(filtered);
  }, [selectedInstitution, selectedStatus, applications]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      console.log('🔄 Updating application status:', applicationId, newStatus);
      
      const result = await institutionService.updateApplicationStatus(applicationId, newStatus);
      
      if (result.success) {
        console.log('✅ Application status updated successfully');
        
        // Update local state
        setApplications(prev => prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        ));
        
        alert(`Application status updated to ${newStatus}`);
      } else {
        alert('Failed to update application status: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Error updating application status: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500 text-black', label: 'Under Review' },
      approved: { color: 'bg-blue-500 text-white', label: 'Approved' },
      rejected: { color: 'bg-red-500 text-white', label: 'Not Accepted' },
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

  const getInstitutionName = (institutionId) => {
    const institution = institutions.find(inst => inst.id === institutionId);
    return institution ? institution.name : 'Unknown Institution';
  };

  // Calculate statistics
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    admitted: applications.filter(app => app.status === 'admitted').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* BLACK HEADER */}
      <header className="professional-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/institution/dashboard" className="text-blue-300 hover:text-orange-400 flex items-center mr-4">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">Student Applications</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {user?.firstName || user?.name || 'Admin'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <div className="elegant-card stat-card-primary p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Total</h3>
              <span className="text-2xl font-bold text-blue-400">{stats.total}</span>
            </div>
            <p className="text-sm text-gray-400">All applications</p>
          </div>
          <div className="elegant-card stat-card-warning p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Pending</h3>
              <span className="text-2xl font-bold text-yellow-400">{stats.pending}</span>
            </div>
            <p className="text-sm text-gray-400">Under review</p>
          </div>
          <div className="elegant-card stat-card-success p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Approved</h3>
              <span className="text-2xl font-bold text-orange-400">{stats.approved}</span>
            </div>
            <p className="text-sm text-gray-400">Accepted</p>
          </div>
          <div className="elegant-card stat-card-danger p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Rejected</h3>
              <span className="text-2xl font-bold text-red-400">{stats.rejected}</span>
            </div>
            <p className="text-sm text-gray-400">Not accepted</p>
          </div>
          <div className="elegant-card stat-card-purple p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Admitted</h3>
              <span className="text-2xl font-bold text-blue-400">{stats.admitted}</span>
            </div>
            <p className="text-sm text-gray-400">Enrolled</p>
          </div>
        </div>

        {/* Filters */}
        <div className="elegant-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Filter Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Institution
              </label>
              <select
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="professional-input"
              >
                <option value="all">All Institutions</option>
                {institutions.map(institution => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="professional-input"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Not Accepted</option>
                <option value="admitted">Admitted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="elegant-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              Applications ({filteredApplications.length})
              {selectedInstitution !== 'all' && ` - ${getInstitutionName(selectedInstitution)}`}
              {selectedStatus !== 'all' && ` - ${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}`}
            </h2>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {applications.length === 0 ? 'No applications found' : 'No applications match your filters'}
              </h3>
              <p className="text-gray-400">
                {applications.length === 0 
                  ? 'No students have applied to any institution yet.' 
                  : 'Try adjusting your filters to see more applications.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredApplications.map((application) => (
                <div key={application.id} className="border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <h3 className="text-lg font-semibold text-white">
                          {application.studentName || 'Student Application'}
                        </h3>
                        {getStatusBadge(application.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400 mb-4">
                        <div>
                          <p><strong className="text-white">Course:</strong> {application.courseName || 'Not specified'}</p>
                          <p><strong className="text-white">Institution:</strong> {getInstitutionName(application.institutionId)}</p>
                          <p><strong className="text-white">Application Date:</strong> {new Date(application.applicationDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p><strong className="text-white">Student Email:</strong> {application.studentEmail || 'Not specified'}</p>
                          <p><strong className="text-white">Student ID:</strong> {application.studentId || 'Not specified'}</p>
                        </div>
                      </div>

                      {/* Action Buttons - Only show for pending applications */}
                      {application.status === 'pending' && (
                        <div className="flex space-x-3 mt-4">
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'approved')}
                            className="btn-professional"
                          >
                            Approve Application
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'rejected')}
                            className="btn-orange"
                          >
                            Reject Application
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'admitted')}
                            className="btn-professional"
                          >
                            Admit Student
                          </button>
                        </div>
                      )}

                      {/* Status message for non-pending applications */}
                      {application.status !== 'pending' && (
                        <div className={`mt-4 p-3 rounded-md ${
                          application.status === 'approved' ? 'bg-green-900 text-green-300' :
                          application.status === 'rejected' ? 'bg-red-900 text-red-300' :
                          application.status === 'admitted' ? 'bg-blue-900 text-blue-300' :
                          'bg-gray-800 text-gray-300'
                        }`}>
                          <p className="text-sm">
                            This application has been <strong>{application.status}</strong>.
                            {application.status === 'approved' && ' You can now admit the student.'}
                            {application.status === 'admitted' && ' The student has been officially admitted.'}
                            {application.status === 'rejected' && ' The application was not successful.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentApplications;