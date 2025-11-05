// src/components/student/InstitutionList.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { institutionService } from '../../services/institutionService';

const InstitutionList = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInstitutions, setFilteredInstitutions] = useState([]);

  const loadInstitutions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await institutionService.getAllInstitutions();
      
      if (response.success && response.data) {
        const institutionsWithCourseCount = await Promise.all(
          response.data.map(async (institution) => {
            try {
              const coursesResponse = await institutionService.getCoursesByInstitution(institution.id);
              const courseCount = coursesResponse.success ? (coursesResponse.data?.length || 0) : 0;
              
              return {
                ...institution,
                courseCount: courseCount
              };
            } catch (error) {
              return {
                ...institution,
                courseCount: 0
              };
            }
          })
        );
        
        setInstitutions(institutionsWithCourseCount || []);
        setFilteredInstitutions(institutionsWithCourseCount || []);
      } else {
        setInstitutions([]);
        setFilteredInstitutions([]);
      }
    } catch (error) {
      setInstitutions([]);
      setFilteredInstitutions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstitutions();
  }, [loadInstitutions]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredInstitutions(institutions);
    } else {
      const filtered = institutions.filter(institution =>
        institution.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institution.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institution.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInstitutions(filtered);
    }
  }, [searchTerm, institutions]);

  const handleViewCourses = (institution) => {
    console.log('Viewing courses for:', institution.name);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading institutions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Institutions</h1>
          <p className="text-gray-300">
            Explore higher learning institutions in Lesotho and their available courses.
          </p>
          
          <div className="mt-2 text-sm text-gray-400">
            Showing {filteredInstitutions.length} of {institutions.length} institutions
          </div>
        </div>

        {/* Search Bar - FIXED VISIBILITY */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search institutions by name, location, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 pr-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ color: '#ffffff' }}
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Institutions Grid */}
        {filteredInstitutions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mx-auto mb-4 text-4xl">🏛️</div>
            <h3 className="text-lg font-medium text-white mb-2">
              {institutions.length === 0 ? 'No institutions available' : 'No institutions found'}
            </h3>
            <p className="text-gray-400">
              {institutions.length === 0 
                ? 'There are no institutions registered in the system yet.' 
                : `No institutions match "${searchTerm}". Try adjusting your search terms.`}
            </p>
            {institutions.length > 0 && searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Search Results Info */}
            {searchTerm && (
              <div className="mb-4 text-sm text-gray-400">
                Found {filteredInstitutions.length} institution(s) matching "{searchTerm}"
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstitutions.map((institution) => (
                <div key={institution.id} className="elegant-card overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {/* Institution Name */}
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {institution.name}
                        </h3>
                        
                        {/* Location */}
                        <div className="flex items-center text-gray-300 mb-3">
                          <span className="text-sm">{institution.location}</span>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`status-badge ${
                        institution.status === 'active' 
                          ? 'bg-green-500 text-black' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {institution.status || 'Unknown'}
                      </span>
                    </div>

                    {/* Description */}
                    {institution.description && (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {institution.description}
                      </p>
                    )}

                    {/* Contact Info */}
                    {institution.email && (
                      <div className="flex items-center text-sm text-gray-400 mb-3">
                        <span>{institution.email}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="text-sm text-gray-400">
                        {institution.courseCount > 0 ? (
                          <span className="flex items-center text-green-400">
                            {institution.courseCount} course(s) available
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-500">
                            No courses listed
                          </span>
                        )}
                      </div>
                      
                      <Link
                        to={`/student/apply/institution/${institution.id}`}
                        onClick={() => handleViewCourses(institution)}
                        className="btn-professional flex items-center"
                      >
                        View Courses
                        <span className="ml-1">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Help Text */}
        <div className="mt-8 bg-blue-900 border border-blue-700 rounded-lg p-4">
          <div className="flex">
            <div className="text-blue-400 mr-3 text-xl">ℹ️</div>
            <div>
              <h4 className="text-sm font-medium text-blue-200">Application Information</h4>
              <p className="text-sm text-blue-300 mt-1">
                You can apply to maximum 2 courses per institution. Make sure to check the entry requirements before applying.
              </p>
              <p className="text-sm text-blue-300 mt-1">
                Contact the institution directly if you have questions about specific courses or requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionList;