// src/components/institution/CourseManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { institutionService } from '../../services/institutionService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState({
    name: '',
    description: '',
    duration: '',
    requirements: '',
    fee: '',
    faculty: '',
    intake: '',
    status: 'active'
  });

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const institutionResult = await institutionService.getInstitutionByUserId(user.uid);
      if (!institutionResult.success) {
        setError('Institution not found');
        return;
      }

      const institution = institutionResult.data;
      const coursesResult = await institutionService.getInstitutionCourses(institution.id);
      
      if (coursesResult.success) {
        setCourses(coursesResult.data);
      } else {
        setError(coursesResult.message);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
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
      const courseWithInstitution = {
        ...courseData,
        institutionId: institution.id,
        institutionName: institution.institutionName || institution.name
      };

      let result;
      if (editingCourse) {
        result = await institutionService.updateCourse(editingCourse.id, courseWithInstitution);
      } else {
        result = await institutionService.createCourse(courseWithInstitution);
      }

      if (result.success) {
        setShowForm(false);
        setEditingCourse(null);
        setCourseData({
          name: '',
          description: '',
          duration: '',
          requirements: '',
          fee: '',
          faculty: '',
          intake: '',
          status: 'active'
        });
        fetchCourses();
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error saving course:', err);
      setError('Failed to save course');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setCourseData({
      name: course.name,
      description: course.description,
      duration: course.duration,
      requirements: course.requirements,
      fee: course.fee,
      faculty: course.faculty,
      intake: course.intake,
      status: course.status
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCourse(null);
    setCourseData({
      name: '',
      description: '',
      duration: '',
      requirements: '',
      fee: '',
      faculty: '',
      intake: '',
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
        <div className="text-white">Loading courses...</div>
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
              <h1 className="text-2xl font-bold text-white">Course Management</h1>
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
            <h2 className="text-xl font-semibold text-white">Academic Programs</h2>
            <button
              onClick={() => setShowForm(true)}
              className="btn-professional"
            >
              Add New Program
            </button>
          </div>

          {showForm && (
            <div className="elegant-card p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingCourse ? 'Edit Academic Program' : 'Add New Program'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Program Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={courseData.name}
                    onChange={handleInputChange}
                    className="professional-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Faculty/Department</label>
                  <input
                    type="text"
                    name="faculty"
                    value={courseData.faculty}
                    onChange={handleInputChange}
                    className="professional-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={courseData.duration}
                    onChange={handleInputChange}
                    className="professional-input"
                    placeholder="e.g., 4 years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tuition Fee</label>
                  <input
                    type="text"
                    name="fee"
                    value={courseData.fee}
                    onChange={handleInputChange}
                    className="professional-input"
                    placeholder="e.g., M15,000 per year"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={courseData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="professional-input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Requirements</label>
                  <textarea
                    name="requirements"
                    value={courseData.requirements}
                    onChange={handleInputChange}
                    rows={2}
                    className="professional-input"
                    placeholder="Entry requirements for this program..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Intake Period</label>
                  <input
                    type="text"
                    name="intake"
                    value={courseData.intake}
                    onChange={handleInputChange}
                    className="professional-input"
                    placeholder="e.g., January, August"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    name="status"
                    value={courseData.status}
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
                    {editingCourse ? 'Update Program' : 'Add Program'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="elegant-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Available Programs</h2>
            
            {courses.length > 0 ? (
              <div className="space-y-6">
                {courses.map((course) => (
                  <div key={course.id} className="border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-white">{course.name}</h3>
                          <span className={`status-badge ${
                            course.status === 'active' 
                              ? 'bg-green-500 text-black' 
                              : 'bg-gray-500 text-white'
                          }`}>
                            {course.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-400">
                              <strong className="text-white">Faculty:</strong> {course.faculty || 'Not specified'}
                            </p>
                            <p className="text-sm text-gray-400">
                              <strong className="text-white">Duration:</strong> {course.duration || 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">
                              <strong className="text-white">Fee:</strong> {course.fee || 'Not specified'}
                            </p>
                            <p className="text-sm text-gray-400">
                              <strong className="text-white">Intake:</strong> {course.intake || 'Not specified'}
                            </p>
                          </div>
                        </div>

                        {course.description && (
                          <p className="text-sm text-gray-300 mb-3">{course.description}</p>
                        )}
                        
                        {course.requirements && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-white mb-2">Entry Requirements:</h4>
                            <p className="text-sm text-gray-300">{course.requirements}</p>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleEdit(course)}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No programs found</h3>
                <p className="text-gray-400 mb-4">Get started by adding your first academic program.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-professional"
                >
                  Add Your First Program
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;