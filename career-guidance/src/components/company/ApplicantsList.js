// src/components/company/ApplicantsList.js
import React, { useState, useEffect, useCallback } from 'react';
import { companyService } from '../../services/companyService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const ApplicantsList = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const result = await companyService.getJobs();
      if (result.success) {
        setJobs(result.data);
        if (result.data.length > 0) {
          setSelectedJob(result.data[0]);
          fetchApplicants(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchApplicants = async (jobId) => {
    try {
      setLoading(true);
      const result = await companyService.getJobApplicants(jobId);
      if (result.success) {
        setApplicants(result.data);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleJobChange = (job) => {
    setSelectedJob(job);
    fetchApplicants(job.id);
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const result = await companyService.updateApplicationStatus(applicationId, newStatus);
      
      if (result.success) {
        setApplicants(prev => prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        ));
        
        setMessage(result.message || `Application ${newStatus} successfully!`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.message || 'Error updating application');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      setMessage('Error updating application status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500 text-black', label: 'Under Review' },
      reviewed: { color: 'bg-blue-500 text-white', label: 'Reviewed' },
      accepted: { color: 'bg-green-500 text-black', label: 'Accepted' },
      rejected: { color: 'bg-red-500 text-white', label: 'Not Accepted' }
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
        <div className="text-white">Loading...</div>
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
              <Link to="/company/dashboard" className="text-blue-300 hover:text-orange-400 flex items-center mr-4">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">Candidate Applications</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {user?.firstName || 'Company'}</span>
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

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Job Applications</h1>
          <p className="text-gray-400 mt-2">Review and manage candidate applications</p>
        </div>

        {message && (
          <div className="elegant-card border-green-500 p-4 mb-6">
            <div className="text-green-300">{message}</div>
          </div>
        )}

        {/* Job Selection */}
        <div className="elegant-card p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Select Position</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => handleJobChange(job)}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedJob?.id === job.id
                    ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                    : 'border-gray-700 hover:border-blue-500 hover:bg-gray-800'
                }`}
              >
                <h3 className="font-semibold text-white">{job.title}</h3>
                <p className="text-sm text-gray-400">{job.location}</p>
                <p className="text-sm text-gray-500">{job.applicantsCount || 0} applicants</p>
              </div>
            ))}
          </div>
        </div>

        {/* Applicants List */}
        {selectedJob && (
          <div className="elegant-card p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Applicants for {selectedJob.title}</h2>
                <p className="text-gray-400">{applicants.length} candidate(s) applied</p>
              </div>
            </div>

            {applicants.length > 0 ? (
              <div className="space-y-6">
                {applicants.map((applicant) => (
                  <div key={applicant.id} className="border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-white">
                            {applicant.studentName}
                          </h3>
                          {getStatusBadge(applicant.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-400">
                              <strong className="text-white">Email:</strong> {applicant.studentEmail}
                            </p>
                            <p className="text-sm text-gray-400">
                              <strong className="text-white">Applied:</strong> {new Date(applicant.appliedDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">
                              <strong className="text-white">Phone:</strong> {applicant.phone || 'Not provided'}
                            </p>
                            <p className="text-sm text-gray-400">
                              <strong className="text-white">Location:</strong> {applicant.location || 'Not specified'}
                            </p>
                          </div>
                        </div>

                        {applicant.coverLetter && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-white mb-2">Cover Letter</h4>
                            <p className="text-gray-300 text-sm bg-gray-800 p-3 rounded">
                              {applicant.coverLetter}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2 flex-wrap gap-2">
                          {applicant.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateApplicationStatus(applicant.id, 'reviewed')}
                                className="btn-professional"
                              >
                                Mark as Reviewed
                              </button>
                              <button
                                onClick={() => updateApplicationStatus(applicant.id, 'accepted')}
                                className="btn-professional"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => updateApplicationStatus(applicant.id, 'rejected')}
                                className="btn-orange"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          
                          {applicant.status === 'reviewed' && (
                            <>
                              <button
                                onClick={() => updateApplicationStatus(applicant.id, 'accepted')}
                                className="btn-professional"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => updateApplicationStatus(applicant.id, 'rejected')}
                                className="btn-orange"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {(applicant.status === 'accepted' || applicant.status === 'rejected') && (
                            <button
                              onClick={() => updateApplicationStatus(applicant.id, 'reviewed')}
                              className="btn-professional"
                            >
                              Re-open for Review
                            </button>
                          )}
                        </div>
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
                <h3 className="text-lg font-medium text-white mb-2">No applications yet</h3>
                <p className="text-gray-400">No candidates have applied to this position yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantsList;