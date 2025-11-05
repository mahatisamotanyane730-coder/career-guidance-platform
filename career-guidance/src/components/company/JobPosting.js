// src/components/company/JobPosting.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useNavigate, Link } from 'react-router-dom';
import { companyService } from '../../services/companyService';

const JobPosting = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    location: 'Maseru, Lesotho',
    salary: '',
    type: 'full-time',
    requirements: [''],
    deadline: ''
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...jobData.requirements];
    newRequirements[index] = value;
    setJobData(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  const addRequirement = () => {
    setJobData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index) => {
    if (jobData.requirements.length > 1) {
      const newRequirements = jobData.requirements.filter((_, i) => i !== index);
      setJobData(prev => ({
        ...prev,
        requirements: newRequirements
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!jobData.title || !jobData.description || !jobData.salary) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const completeJobData = {
        ...jobData,
        companyId: user.uid,
        companyName: user.companyName || user.firstName + ' ' + user.lastName,
        status: 'open',
        postedDate: new Date().toISOString(),
        deadline: jobData.deadline || '2024-12-31',
        requirements: jobData.requirements.filter(req => req.trim() !== ''),
        applicantsCount: 0
      };

      console.log('Submitting job to Firebase:', completeJobData);

      const result = await companyService.createJob(completeJobData);
      
      if (result.success) {
        showNotification('Job posted successfully!', 'success');
        
        setJobData({
          title: '',
          description: '',
          location: 'Maseru, Lesotho',
          salary: '',
          type: 'full-time',
          requirements: [''],
          deadline: ''
        });

        setTimeout(() => {
          navigate('/company/dashboard');
        }, 2000);

      } else {
        setError(result.message || 'Error posting job');
        showNotification(result.message || 'Error posting job', 'error');
      }

    } catch (error) {
      console.error('Error posting job:', error);
      setError('Error posting job. Please try again.');
      showNotification('Error posting job. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* BLACK HEADER */}
      <header className="professional-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/company/dashboard"
                className="text-blue-300 hover:text-orange-400 flex items-center"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">Post New Position</h1>
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

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="elegant-card p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Create New Position</h1>
            <p className="text-gray-400 mt-2">Fill in the details below to create a new job opening.</p>
          </div>

          {error && (
            <div className="elegant-card border-red-500 p-4 mb-6">
              <div className="text-red-300">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Position Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={jobData.title}
                onChange={handleInputChange}
                className="professional-input"
                placeholder="e.g., Software Developer"
                required
              />
            </div>

            {/* Job Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Position Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={jobData.description}
                onChange={handleInputChange}
                rows={4}
                className="professional-input"
                placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                required
              />
            </div>

            {/* Location and Salary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={jobData.location}
                  onChange={handleInputChange}
                  className="professional-input"
                  placeholder="e.g., Maseru, Lesotho"
                />
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-300 mb-2">
                  Salary Range *
                </label>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  value={jobData.salary}
                  onChange={handleInputChange}
                  className="professional-input"
                  placeholder="e.g., M15,000 - M20,000"
                  required
                />
              </div>
            </div>

            {/* Job Type and Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
                  Employment Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={jobData.type}
                  onChange={handleInputChange}
                  className="professional-input"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={jobData.deadline}
                  onChange={handleInputChange}
                  className="professional-input"
                />
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Requirements
              </label>
              <div className="space-y-2">
                {jobData.requirements.map((requirement, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      className="flex-1 professional-input"
                      placeholder={`Requirement ${index + 1}`}
                    />
                    {jobData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="btn-orange"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRequirement}
                  className="btn-professional"
                >
                  Add Requirement
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link
                to="/company/dashboard"
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-professional flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting Position...
                  </>
                ) : (
                  'Post Position'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobPosting;