// src/components/company/CandidateProfile.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CandidateProfile = () => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { candidateId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchCandidateProfile = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockCandidate = {
        id: candidateId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+266 1234 5678',
        location: 'Maseru, Lesotho',
        education: [
          {
            institution: 'National University of Lesotho',
            degree: 'Bachelor of Science in Computer Science',
            year: '2023',
            grade: 'First Class'
          }
        ],
        experience: [
          {
            company: 'Tech Solutions Ltd',
            position: 'Junior Developer',
            duration: '2023 - Present',
            description: 'Developed web applications using React and Node.js'
          }
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
        certifications: ['AWS Certified Developer', 'Google Cloud Associate'],
        resumeUrl: '#',
        appliedDate: '2024-01-15',
        status: 'pending',
        coverLetter: 'I am excited to apply for this position as it aligns perfectly with my skills and career goals. I have experience in web development and am eager to contribute to your team.',
        jobApplied: 'Software Developer'
      };
      
      setCandidate(mockCandidate);
    } catch (error) {
      console.error('Error fetching candidate profile:', error);
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchCandidateProfile();
  }, [fetchCandidateProfile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const updateApplicationStatus = async (newStatus) => {
    try {
      setMessage(`Application ${newStatus} successfully!`);
      setTimeout(() => setMessage(''), 3000);
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
        <div className="text-white">Loading candidate profile...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Candidate Not Found</h1>
          <Link
            to="/company/applications"
            className="btn-professional"
          >
            Back to Applications
          </Link>
        </div>
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
                to="/company/applications"
                className="text-blue-300 hover:text-orange-400 flex items-center"
              >
                ← Back to Applications
              </Link>
              <h1 className="text-2xl font-bold text-white">Candidate Profile</h1>
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

      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {message && (
          <div className="elegant-card border-green-500 p-4 mb-6">
            <div className="text-green-300">{message}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Candidate Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="elegant-card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{candidate.name}</h2>
                  <p className="text-gray-400">Applied for: {candidate.jobApplied}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(candidate.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">
                    <strong className="text-white">Email:</strong> {candidate.email}
                  </p>
                  <p className="text-sm text-gray-400">
                    <strong className="text-white">Phone:</strong> {candidate.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">
                    <strong className="text-white">Location:</strong> {candidate.location}
                  </p>
                  <p className="text-sm text-gray-400">
                    <strong className="text-white">Applied:</strong> {new Date(candidate.appliedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 flex-wrap gap-2">
                {candidate.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateApplicationStatus('reviewed')}
                      className="btn-professional"
                    >
                      Mark as Reviewed
                    </button>
                    <button
                      onClick={() => updateApplicationStatus('accepted')}
                      className="btn-professional"
                    >
                      Accept Application
                    </button>
                    <button
                      onClick={() => updateApplicationStatus('rejected')}
                      className="btn-orange"
                    >
                      Reject Application
                    </button>
                  </>
                )}
                
                {candidate.status === 'reviewed' && (
                  <>
                    <button
                      onClick={() => updateApplicationStatus('accepted')}
                      className="btn-professional"
                    >
                      Accept Application
                    </button>
                    <button
                      onClick={() => updateApplicationStatus('rejected')}
                      className="btn-orange"
                    >
                      Reject Application
                    </button>
                  </>
                )}

                <button
                  onClick={() => window.open(candidate.resumeUrl, '_blank')}
                  className="btn-professional"
                >
                  View Resume
                </button>
              </div>
            </div>

            {/* Cover Letter */}
            {candidate.coverLetter && (
              <div className="elegant-card p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Cover Letter</h3>
                <p className="text-gray-300 whitespace-pre-line">{candidate.coverLetter}</p>
              </div>
            )}

            {/* Education */}
            <div className="elegant-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Education</h3>
              <div className="space-y-4">
                {candidate.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-white">{edu.degree}</h4>
                    <p className="text-gray-400">{edu.institution}</p>
                    <p className="text-sm text-gray-500">
                      {edu.year} {edu.grade && `• ${edu.grade}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Experience */}
            <div className="elegant-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Work Experience</h3>
              <div className="space-y-4">
                {candidate.experience.map((exp, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-white">{exp.position}</h4>
                    <p className="text-gray-400">{exp.company}</p>
                    <p className="text-sm text-gray-500">{exp.duration}</p>
                    <p className="text-gray-300 mt-2">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Skills & Additional Info */}
          <div className="space-y-6">
            {/* Skills */}
            <div className="elegant-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {candidate.certifications && candidate.certifications.length > 0 && (
              <div className="elegant-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Certifications</h3>
                <ul className="space-y-2">
                  {candidate.certifications.map((cert, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact Information */}
            <div className="elegant-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              <div className="space-y-2">
                <p className="flex items-center text-gray-300">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {candidate.email}
                </p>
                <p className="flex items-center text-gray-300">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {candidate.phone}
                </p>
                <p className="flex items-center text-gray-300">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {candidate.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;