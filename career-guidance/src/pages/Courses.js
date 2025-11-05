import React, { useState, useEffect } from 'react';
import { institutionService } from '../services/institutionService';
import { BookOpen, Building, Clock, DollarSign } from 'lucide-react';
import Loader from '../components/common/Loader';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const result = await institutionService.getCourses();
      setCourses(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error</h1>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
          <p className="text-gray-600 mt-2">
            Discover courses from various institutions in Lesotho
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="h-4 w-4 mr-2" />
                  {course.institutionName}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {course.duration}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  M {course.fees?.toLocaleString()}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Minimum Grade: {course.requirements?.minimumGrade}</li>
                  <li>Subjects: {course.requirements?.subjects?.join(', ')}</li>
                </ul>
              </div>

              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  course.status === 'open' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {course.status === 'open' ? 'Open' : 'Closed'}
                </span>
                <button className="btn-primary text-sm">
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No courses available</h3>
            <p className="text-gray-600 mt-1">Check back later for new course offerings.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;