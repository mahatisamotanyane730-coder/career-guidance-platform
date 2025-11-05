// src/components/institution/InstitutionProfile.js
import React, { useState, useEffect, useCallback } from 'react';
import { institutionService } from '../../services/institutionService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const InstitutionProfile = () => {
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    institutionName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: '',
    established: '',
    type: '',
    accreditation: '',
    contactPerson: '',
    contactPosition: ''
  });

  const fetchInstitutionProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📊 Fetching institution profile for user:', user.uid);
      const result = await institutionService.getInstitutionByUserId(user.uid);
      
      if (result.success) {
        const institutionData = result.data;
        console.log('🏛️ Institution data:', institutionData);
        setInstitution(institutionData);
        
        setProfileData({
          institutionName: institutionData.institutionName || institutionData.name || '',
          email: institutionData.email || user.email || '',
          phone: institutionData.phone || '',
          address: institutionData.address || '',
          website: institutionData.website || '',
          description: institutionData.description || '',
          established: institutionData.established || institutionData.establishedYear || '',
          type: institutionData.type || '',
          accreditation: institutionData.accreditation || '',
          contactPerson: institutionData.contactPerson || '',
          contactPosition: institutionData.contactPosition || ''
        });
      } else {
        setError(result.message || 'Failed to load institution profile');
      }
    } catch (err) {
      console.error('❌ Error fetching institution profile:', err);
      setError('Failed to load institution profile');
    } finally {
      setLoading(false);
    }
  }, [user.uid, user.email]);

  useEffect(() => {
    fetchInstitutionProfile();
  }, [fetchInstitutionProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (!institution) {
        setError('Institution not found');
        return;
      }

      console.log('💾 Saving profile data:', profileData);
      const result = await institutionService.updateInstitutionProfile(institution.id, profileData);
      
      if (result.success) {
        setMessage('Profile updated successfully!');
        await fetchInstitutionProfile();
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('❌ Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
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
              <h1 className="text-2xl font-bold text-white">Institution Profile</h1>
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

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="elegant-card p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Institution Information</h1>
            <p className="text-gray-400 mt-2">Update your institution's profile information.</p>
          </div>

          {message && (
            <div className="elegant-card border-green-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-400">Success</h3>
                  <div className="mt-1 text-sm text-green-300">
                    <p>{message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Institution Name *</label>
                <input
                  type="text"
                  name="institutionName"
                  value={profileData.institutionName}
                  onChange={handleInputChange}
                  className="professional-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="professional-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="professional-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={profileData.website}
                  onChange={handleInputChange}
                  className="professional-input"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Established Year</label>
                <input
                  type="number"
                  name="established"
                  value={profileData.established}
                  onChange={handleInputChange}
                  className="professional-input"
                  placeholder="e.g., 1990"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Institution Type</label>
                <select
                  name="type"
                  value={profileData.type}
                  onChange={handleInputChange}
                  className="professional-input"
                >
                  <option value="">Select type</option>
                  <option value="university">University</option>
                  <option value="college">College</option>
                  <option value="technical">Technical Institute</option>
                  <option value="vocational">Vocational School</option>
                  <option value="polytechnic">Polytechnic</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Accreditation</label>
              <input
                type="text"
                name="accreditation"
                value={profileData.accreditation}
                onChange={handleInputChange}
                className="professional-input"
                placeholder="e.g., Accredited by Ministry of Education"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={profileData.contactPerson}
                  onChange={handleInputChange}
                  className="professional-input"
                  placeholder="Full name of contact person"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contact Position</label>
                <input
                  type="text"
                  name="contactPosition"
                  value={profileData.contactPosition}
                  onChange={handleInputChange}
                  className="professional-input"
                  placeholder="e.g., Admissions Officer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
              <textarea
                name="address"
                value={profileData.address}
                onChange={handleInputChange}
                rows={3}
                className="professional-input"
                placeholder="Full institution address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Institution Description</label>
              <textarea
                name="description"
                value={profileData.description}
                onChange={handleInputChange}
                rows={4}
                className="professional-input"
                placeholder="Describe your institution, mission, values, and what makes you unique..."
              />
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={saving}
                className="btn-professional flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InstitutionProfile;