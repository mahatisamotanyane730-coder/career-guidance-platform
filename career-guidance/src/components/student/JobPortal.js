// src/components/student/JobPortal.js
import React, { useState, useEffect, useCallback } from 'react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../contexts/AuthContext';
import JobApplication from './JobApplication';

const JobPortal = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplication, setShowApplication] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const [myApplications, setMyApplications] = useState([]);

  const { user } = useAuth();

  const fetchAvailableJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await studentService.getAvailableJobs();
      if (result.success) {
        setJobs(result.data);
      } else {
        setError(result.message || 'Failed to load jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Error loading jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyJobApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await studentService.getMyJobApplications(user.uid);
      if (result.success) {
        setMyApplications(result.data);
      } else {
        setError(result.message || 'Failed to load your applications');
      }
    } catch (error) {
      console.error('Error fetching job applications:', error);
      setError('Error loading your applications');
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    if (activeTab === 'available') {
      fetchAvailableJobs();
    } else {
      fetchMyJobApplications();
    }
  }, [activeTab, fetchAvailableJobs, fetchMyJobApplications]);

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplication(true);
  };

  const handleApplicationSuccess = (successMessage) => {
    setMessage(successMessage);
    setShowApplication(false);
    setSelectedJob(null);
    
    fetchAvailableJobs();
    if (activeTab === 'myApplications') {
      fetchMyJobApplications();
    }
    
    setTimeout(() => setMessage(''), 3000);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-500 text-black',
      reviewed: 'bg-blue-500 text-white',
      accepted: 'bg-green-500 text-white',
      rejected: 'bg-red-500 text-white'
    };
    
    return (
      <span className={`status-badge ${statusColors[status] || 'bg-gray-500 text-white'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Job Portal</h1>
        
        {message && (
          <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('available')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-orange-400 hover:border-gray-500'
              }`}
            >
              Available Jobs
            </button>
            <button
              onClick={() => setActiveTab('myApplications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'myApplications'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-orange-400 hover:border-gray-500'
              }`}
            >
              My Applications ({myApplications.length})
            </button>
          </nav>
        </div>

        {/* Available Jobs Tab */}
        {activeTab === 'available' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job.id} className="elegant-card p-6 hover:border-blue-500 transition-colors">
                <h3 className="text-xl font-semibold text-white mb-2">{job.title}</h3>
                <p className="text-orange-400 mb-2 font-medium">{job.company?.companyName || 'Company'}</p>
                <p className="text-gray-300 mb-4 line-clamp-3">{job.description}</p>
                
                <div className="mb-4 space-y-2">
                  <p className="text-sm text-gray-400">
                    <strong>Location:</strong> {job.location}
                  </p>
                  <p className="text-sm text-gray-400">
                    <strong>Salary:</strong> {job.salary}
                  </p>
                  <p className="text-sm text-gray-400">
                    <strong>Type:</strong> {job.type}
                  </p>
                  <p className="text-sm text-gray-400">
                    <strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-300 mb-2 text-sm">Requirements:</h4>
                  <div className="flex flex-wrap gap-1">
                    {job.requirements?.map((req, index) => (
                      <span 
                        key={index}
                        className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs border border-gray-600"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleApply(job)}
                  disabled={job.hasApplied}
                  className={`w-full py-2 px-4 rounded-md transition duration-200 ${
                    job.hasApplied
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'btn-professional'
                  }`}
                >
                  {job.hasApplied ? 'Already Applied' : 'Apply Now'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* My Applications Tab */}
        {activeTab === 'myApplications' && (
          <div className="space-y-4">
            {myApplications.map((application) => (
              <div key={application.id} className="elegant-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{application.job?.title}</h3>
                    <p className="text-orange-400">{application.job?.company?.companyName}</p>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">
                      <strong>Applied Date:</strong> {new Date(application.appliedDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-400">
                      <strong>Location:</strong> {application.job?.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">
                      <strong>Salary:</strong> {application.job?.salary}
                    </p>
                    <p className="text-sm text-gray-400">
                      <strong>Type:</strong> {application.job?.type}
                    </p>
                  </div>
                </div>
                
                {application.coverLetter && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-300 mb-2">Cover Letter:</h4>
                    <p className="text-gray-300 text-sm bg-gray-800 p-3 rounded border border-gray-700">
                      {application.coverLetter}
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {myApplications.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">You haven't applied for any jobs yet.</p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="mt-2 text-blue-400 hover:text-orange-400"
                >
                  Browse available jobs
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'available' && jobs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">No job openings available at the moment.</p>
          </div>
        )}

        {showApplication && selectedJob && (
          <JobApplication
            job={selectedJob}
            onClose={() => {
              setShowApplication(false);
              setSelectedJob(null);
            }}
            onSuccess={handleApplicationSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default JobPortal;