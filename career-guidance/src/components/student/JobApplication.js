// src/components/student/JobApplication.js
import React, { useState } from 'react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../contexts/AuthContext';

const JobApplication = ({ job, onClose, onSuccess }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await studentService.applyForJob(job.id, {
        studentId: user.uid,
        coverLetter
      });

      if (result.success) {
        onSuccess(result.message || 'Application submitted successfully!');
      } else {
        setError(result.message || 'Failed to apply for job');
      }
    } catch (err) {
      setError('An error occurred while applying');
      console.error('Application error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="elegant-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Apply for {job.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-light transition-colors"
          >
            ×
          </button>
        </div>
        
        {/* Job Details */}
        <div className="bg-dark-gray p-6 rounded-lg mb-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Job Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 font-medium">Company:</span>
                <p className="text-white mt-1">{job.company?.companyName}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Location:</span>
                <p className="text-white mt-1">{job.location}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Type:</span>
                <p className="text-white mt-1 capitalize">{job.type}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 font-medium">Salary:</span>
                <p className="text-orange-400 mt-1 font-medium">{job.salary}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Deadline:</span>
                <p className="text-white mt-1">{new Date(job.deadline).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <h4 className="text-gray-400 font-medium mb-2">Description:</h4>
            <p className="text-gray-300 leading-relaxed">{job.description}</p>
          </div>

          {job.requirements && job.requirements.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="text-gray-400 font-medium mb-3">Requirements:</h4>
              <div className="flex flex-wrap gap-2">
                {job.requirements?.map((req, index) => (
                  <span 
                    key={index}
                    className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-xs font-medium border border-blue-700"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <div className="text-red-400 mr-2 text-lg">⚠️</div>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleApply}>
          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-3">
              Cover Letter (Optional)
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="6"
              placeholder="Tell us why you're interested in this position and why you'd be a good fit..."
              style={{ color: '#ffffff' }}
            />
            <p className="text-xs text-gray-400 mt-2">
              Briefly describe your qualifications, experience, and why you're interested in this role.
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-professional flex items-center space-x-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Applying...</span>
                </>
              ) : (
                <>
                  <span>Submit Application</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplication;