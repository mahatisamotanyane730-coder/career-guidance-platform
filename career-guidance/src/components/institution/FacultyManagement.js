// src/components/institution/FacultyManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { institutionService } from '../../services/institutionService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const FacultyManagement = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [facultyData, setFacultyData] = useState({
    name: '',
    description: '',
    dean: '',
    email: '',
    phone: '',
    status: 'active'
  });

  const fetchFaculties = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const institutionResult = await institutionService.getInstitutionByUserId(user.uid);
      if (!institutionResult.success) {
        setError('Institution not found');
        return;
      }

      const institution = institutionResult.data;
      const facultiesResult = await institutionService.getInstitutionFaculties(institution.id);
      
      if (facultiesResult.success) {
        setFaculties(facultiesResult.data);
      } else {
        setError(facultiesResult.message);
      }
    } catch (err) {
      console.error('Error fetching faculties:', err);
      setError('Failed to load faculties');
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    fetchFaculties();
  }, [fetchFaculties]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFacultyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const institutionResult = await institutionService.getInstitutionByUserId(user.uid);
      if (!institutionResult.success) {
        setError('Institution not found');
        return;
      }

      const institution = institutionResult.data;
      const facultyWithInstitution = {
        ...facultyData,
        institutionId: institution.id,
        institutionName: institution.institutionName || institution.name
      };

      let result;
      if (editingFaculty) {
        result = await institutionService.updateFaculty(editingFaculty.id, facultyWithInstitution);
      } else {
        result = await institutionService.createFaculty(facultyWithInstitution);
      }

      if (result.success) {
        setShowForm(false);
        setEditingFaculty(null);
        setFacultyData({
          name: '',
          description: '',
          dean: '',
          email: '',
          phone: '',
          status: 'active'
        });
        fetchFaculties();
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error saving faculty:', err);
      setError('Failed to save faculty');
    }
  };

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty);
    setFacultyData({
      name: faculty.name,
      description: faculty.description,
      dean: faculty.dean,
      email: faculty.email,
      phone: faculty.phone,
      status: faculty.status
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFaculty(null);
    setFacultyData({
      name: '',
      description: '',
      dean: '',
      email: '',
      phone: '',
      status: 'active'
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading faculties...</div>
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
                to="/institution/dashboard"
                className="text-blue-300 hover:text-orange-400 flex items-center"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">Faculty Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {user?.institutionName || user?.firstName}</span>
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
          {error && (
            <div className="elegant-card border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-400">Error</h3>
                  <div className="mt-1 text-sm text-red-300">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Faculties & Departments</h2>
            <button
              onClick={() => setShowForm(true)}
              className="btn-professional"
            >
              Add New Faculty
            </button>
          </div>

          {showForm && (
            <div className="elegant-card p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Faculty Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={facultyData.name}
                    onChange={handleInputChange}
                    className="professional-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Dean/Head</label>
                  <input
                    type="text"
                    name="dean"
                    value={facultyData.dean}
                    onChange={handleInputChange}
                    className="professional-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contact Email</label>
                  <input
                    type="email"
                    name="email"
                    value={facultyData.email}
                    onChange={handleInputChange}
                    className="professional-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contact Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={facultyData.phone}
                    onChange={handleInputChange}
                    className="professional-input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={facultyData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="professional-input"
                    placeholder="Describe the faculty, its programs, and specializations..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    name="status"
                    value={facultyData.status}
                    onChange={handleInputChange}
                    className="professional-input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-professional"
                  >
                    {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="elegant-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Academic Departments</h2>
            
            {faculties.length > 0 ? (
              <div className="space-y-6">
                {faculties.map((faculty) => (
                  <div key={faculty.id} className="border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-white">{faculty.name}</h3>
                          <span className={`status-badge ${
                            faculty.status === 'active' 
                              ? 'bg-green-500 text-black' 
                              : 'bg-gray-500 text-white'
                          }`}>
                            {faculty.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            {faculty.dean && (
                              <p className="text-sm text-gray-400">
                                <strong className="text-white">Dean:</strong> {faculty.dean}
                              </p>
                            )}
                            {faculty.email && (
                              <p className="text-sm text-gray-400">
                                <strong className="text-white">Email:</strong> {faculty.email}
                              </p>
                            )}
                          </div>
                          <div>
                            {faculty.phone && (
                              <p className="text-sm text-gray-400">
                                <strong className="text-white">Phone:</strong> {faculty.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        {faculty.description && (
                          <p className="text-sm text-gray-300">{faculty.description}</p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleEdit(faculty)}
                        className="btn-professional ml-4"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No faculties found</h3>
                <p className="text-gray-400 mb-4">Get started by adding your first faculty or department.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-professional"
                >
                  Add Your First Faculty
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyManagement;