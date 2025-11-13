// src/components/student/QualifiedJobs.js
import React, { useState, useEffect, useCallback } from 'react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import CVBuilder from './CVBuilder';

const QualifiedJobs = () => {
  const { user } = useAuth();
  const [qualifiedJobs, setQualifiedJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingJob, setApplyingJob] = useState(null);
  const [viewMode, setViewMode] = useState('qualified');
  const [showCVBuilder, setShowCVBuilder] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Define helper functions BEFORE using them
  const calculateMatchPercentage = (job) => {
    if (!transcript?.completedSubjects || !job.requirements) return 0;
    
    const studentSubjects = transcript.completedSubjects.map(s => s.toLowerCase());
    const jobRequirements = job.requirements.map(r => r.toLowerCase());
    
    let matchCount = 0;
    jobRequirements.forEach(req => {
      if (studentSubjects.some(subject => 
        subject.includes(req) || req.includes(subject) ||
        studentService.checkSkillMatch(subject, req)
      )) {
        matchCount++;
      }
    });
    
    return Math.round((matchCount / jobRequirements.length) * 100);
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getMatchBadge = (percentage) => {
    if (percentage >= 80) return 'bg-green-500 text-white';
    if (percentage >= 60) return 'bg-yellow-500 text-black';
    if (percentage >= 40) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getMatchLabel = (percentage) => {
    if (percentage >= 80) return 'Excellent Match';
    if (percentage >= 60) return 'Good Match';
    if (percentage >= 40) return 'Fair Match';
    return 'Low Match';
  };

  const loadQualifiedJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const jobsResponse = await studentService.getQualifiedJobs(user.uid);
      
      if (jobsResponse.success) {
        const { qualifiedJobs, allJobs, transcript } = jobsResponse.data;
        
        setQualifiedJobs(qualifiedJobs);
        setAllJobs(allJobs);
        setTranscript(transcript);
        
        if (qualifiedJobs.length === 0 && transcript) {
          setError('No jobs found that match your qualifications. Consider updating your subjects or checking all available jobs.');
        }
      } else {
        setError('Failed to load jobs: ' + jobsResponse.message);
      }
    } catch (err) {
      console.error('Error loading qualified jobs:', err);
      setError('Error loading job opportunities: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  const handleCVGenerated = (cvText) => {
    // Auto-submit application after CV is generated
    handleApplyForJob(selectedJob, cvText);
  };

  const handleApplyForJob = async (job, customCV = '') => {
    if (!user?.uid) {
      alert('Please log in to apply for jobs.');
      return;
    }

    // If no CV content and we have a selected job, show CV builder
    if (!customCV && job) {
      setSelectedJob(job);
      setShowCVBuilder(true);
      return;
    }

    setApplyingJob(job.id);

    try {
      let result;
      if (customCV) {
        result = await studentService.applyForJobWithCV(job.id, user.uid, customCV);
      } else {
        result = await studentService.applyForJobWithTranscript(job.id, user.uid);
      }
      
      if (result.success) {
        alert(`Successfully applied for ${job.title}!`);
        // Reset CV states
        setShowCVBuilder(false);
        setSelectedJob(null);
        // Reload to update application status
        await loadQualifiedJobs();
      } else {
        alert('Failed to submit application: ' + result.message);
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Error applying for job: ' + error.message);
    } finally {
      setApplyingJob(null);
    }
  };

  const handleQuickApply = async (job) => {
    setApplyingJob(job.id);
    try {
      const result = await studentService.applyForJobWithTranscript(job.id, user.uid);
      
      if (result.success) {
        alert(`Successfully applied for ${job.title}!`);
        await loadQualifiedJobs();
      } else {
        alert('Failed to submit application: ' + result.message);
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Error applying for job: ' + error.message);
    } finally {
      setApplyingJob(null);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadQualifiedJobs();
    }
  }, [loadQualifiedJobs, user?.uid]);

  const jobsToShow = viewMode === 'qualified' ? qualifiedJobs : allJobs;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Finding jobs that match your qualifications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="professional-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                to="/student/dashboard"
                className="text-blue-300 hover:text-orange-400 flex items-center transition-colors duration-300"
              >
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Career Opportunities
                </h1>
                <p className="text-gray-300">
                  Jobs matched to your university qualifications
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-300">
              {qualifiedJobs.length} of {allJobs.length} jobs match your profile
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-900 border border-red-700 rounded-lg p-4 transition-all duration-300">
            <div className="flex items-center">
              <span className="text-red-200">{error}</span>
            </div>
          </div>
        )}

        {!transcript && (
          <div className="elegant-card p-6 mb-6 bg-gradient-to-r from-purple-900 to-blue-900 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Upload Your University Transcript First</h3>
                <p className="text-purple-200">
                  To see jobs that match your qualifications, please upload your university transcript.
                </p>
              </div>
              <Link
                to="/student/dashboard?edit=transcript"
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-md font-medium transition-colors duration-300 flex items-center"
              >
                Upload Transcript
              </Link>
            </div>
          </div>
        )}

        {transcript && (
          <div className="elegant-card p-6 mb-6 bg-gradient-to-r from-blue-900 to-purple-900 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Your University Qualifications</h2>
                <p className="text-gray-300 text-sm mt-1">
                  Based on your university subjects, we've matched you with relevant job opportunities
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setViewMode('qualified')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                    viewMode === 'qualified' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Qualified Jobs ({qualifiedJobs.length})
                </button>
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                    viewMode === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  All Jobs ({allJobs.length})
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-300 text-sm mb-2">Your University Subjects:</p>
              <div className="flex flex-wrap gap-2">
                {transcript.completedSubjects?.map((subject) => (
                  <div key={subject} className="bg-green-600 rounded-lg px-3 py-1 transition-all duration-300">
                    <span className="text-white text-sm font-medium">{subject}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CV BUILDER MODAL */}
        {showCVBuilder && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    Build Your CV for {selectedJob.title}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCVBuilder(false);
                      setSelectedJob(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <CVBuilder 
                  jobId={selectedJob.id}
                  onCVGenerated={handleCVGenerated}
                />
              </div>
            </div>
          </div>
        )}

        <div className="elegant-card p-6 transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              {viewMode === 'qualified' ? 'Jobs Matching Your Profile' : 'All Available Jobs'} ({jobsToShow.length})
            </h2>
            <div className="text-sm text-gray-400">
              {viewMode === 'qualified' ? 'Sorted by best match' : 'Showing all opportunities'}
            </div>
          </div>

          {jobsToShow.length > 0 ? (
            <div className="space-y-6">
              {jobsToShow.map((job) => {
                const matchPercentage = calculateMatchPercentage(job);
                const isQualified = qualifiedJobs.some(qj => qj.id === job.id);
                
                return (
                  <div key={job.id} className={`border rounded-lg p-6 bg-gradient-to-br from-gray-800 to-gray-900 transition-all duration-300 ${
                    isQualified ? 'border-green-600 hover:border-green-500' : 'border-gray-600 hover:border-gray-500'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {job.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchBadge(matchPercentage)}`}>
                            {getMatchLabel(matchPercentage)}
                          </span>
                        </div>
                        <p className="text-blue-300 font-medium">{job.company?.companyName || 'Company'}</p>
                        <p className="text-gray-400 text-sm">{job.location} • {job.type}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getMatchColor(matchPercentage)}`}>
                          {matchPercentage}% Match
                        </div>
                        <div className="text-orange-300 font-medium text-sm mt-1">
                          {job.salary}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="mb-4">
                      <p className="text-gray-400 text-sm font-medium mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements?.map((requirement, index) => {
                          const hasMatch = transcript?.completedSubjects?.some(subject => 
                            subject.toLowerCase().includes(requirement.toLowerCase()) ||
                            requirement.toLowerCase().includes(subject.toLowerCase()) ||
                            studentService.checkSkillMatch(subject, requirement)
                          );
                          
                          return (
                            <span 
                              key={index}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                                hasMatch 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-600 text-gray-300'
                              }`}
                            >
                              {requirement} {hasMatch && '✓'}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                      <div className="text-sm text-gray-400">
                        Apply before: {new Date(job.deadline).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApplyForJob(job)}
                          disabled={applyingJob === job.id || !isQualified}
                          className={`px-4 py-2 rounded-md font-medium transition-colors duration-300 ${
                            isQualified 
                              ? 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50' 
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {applyingJob === job.id ? 'Applying...' : 
                          isQualified ? 'Apply with CV' : 'Not Qualified'}
                        </button>
                        
                        <button
                          onClick={() => handleQuickApply(job)}
                          disabled={applyingJob === job.id || !isQualified}
                          className={`px-4 py-2 rounded-md font-medium transition-colors duration-300 ${
                            isQualified 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50' 
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Quick Apply
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-white mb-2">No Jobs Available</h3>
              <p className="text-gray-400 mb-4">
                {viewMode === 'qualified' 
                  ? 'No jobs currently match your qualifications. Try updating your subjects or view all available jobs.'
                  : 'No job opportunities are currently available.'
                }
              </p>
              {viewMode === 'qualified' && (
                <button
                  onClick={() => setViewMode('all')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                >
                  View All Jobs
                </button>
              )}
            </div>
          )}
        </div>

        <div className="elegant-card p-6 mt-6 bg-gradient-to-r from-blue-900 to-blue-800 transition-all duration-300">
          <div className="flex items-start">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">How Job Matching Works</h3>
              <p className="text-blue-200 text-sm">
                • Jobs are matched based on your university subjects and skills<br/>
                • We compare your subjects with job requirements<br/>
                • Higher match percentage means better qualification fit<br/>
                • You can only apply to jobs where you meet the minimum qualifications<br/>
                • Update your transcript to see more job matches
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualifiedJobs;