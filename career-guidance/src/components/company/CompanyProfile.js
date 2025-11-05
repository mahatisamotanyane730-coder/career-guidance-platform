// src/components/company/CompanyProfile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const CompanyProfile = () => {
  const [profileData, setProfileData] = useState({
    companyName: '',
    email: '',
    phone: '',
    industry: '',
    website: '',
    description: '',
    address: '',
    size: '',
    founded: '',
    contactPerson: '',
    contactPosition: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        companyName: user.companyName || '',
        email: user.email || '',
        phone: user.phone || '',
        industry: user.industry || '',
        website: user.website || '',
        description: user.description || '',
        address: user.address || '',
        size: user.size || '',
        founded: user.founded || '',
        contactPerson: user.contactPerson || `${user.firstName} ${user.lastName}`,
        contactPosition: user.contactPosition || ''
      }));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (!profileData.companyName || !profileData.email || !profileData.industry) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const updateData = {
        ...profileData,
        updatedAt: new Date().toISOString()
      };

      console.log('Updating company profile:', updateData);

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('Company profile updated successfully!');

    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error updating profile. Please try again.');
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
              <h1 className="text-2xl font-bold text-white">Company Profile</h1>
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
            <h1 className="text-3xl font-bold text-white">Company Information</h1>
            <p className="text-gray-400 mt-2">Update your company profile information.</p>
          </div>

          {message && (
            <div className="elegant-card border-green-500 p-4 mb-6">
              <div className="text-green-300">{message}</div>
            </div>
          )}

          {error && (
            <div className="elegant-card border-red-500 p-4 mb-6">
              <div className="text-red-300">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={profileData.companyName}
                  onChange={handleInputChange}
                  className="professional-input"
                  placeholder="Your company name"
                  required
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-2">
                  Industry *
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={profileData.industry}
                  onChange={handleInputChange}
                  className="professional-input"
                  placeholder="e.g., Technology, Healthcare, Finance"
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="professional-input"
                  placeholder="company@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="professional-input"
                  placeholder="+266 1234 5678"
                />
              </div>
            </div>

            {/* Company Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={profileData.website}
                  onChange={handleInputChange}
                  className="professional-input"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-300 mb-2">
                  Company Size
                </label>
                <select
                  id="size"
                  name="size"
                  value={profileData.size}
                  onChange={handleInputChange}
                  className="professional-input"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>

              <div>
                <label htmlFor="founded" className="block text-sm font-medium text-gray-300 mb-2">
                  Founded Year
                </label>
                <input
                  type="number"
                  id="founded"
                  name="founded"
                  value={profileData.founded}
                  onChange={handleInputChange}
                  className="professional-input"
                  placeholder="2020"
                  min="1900"
                  max="2024"
                />
              </div>
            </div>

            {/* Contact Person */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={profileData.contactPerson}
                  onChange={handleInputChange}
                  className="professional-input"
                  placeholder="Full name of contact person"
                />
              </div>

              <div>
                <label htmlFor="contactPosition" className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Position
                </label>
                <input
                  type="text"
                  id="contactPosition"
                  name="contactPosition"
                  value={profileData.contactPosition}
                  onChange={handleInputChange}
                  className="professional-input"
                  placeholder="e.g., HR Manager, CEO"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
                Company Address
              </label>
              <textarea
                id="address"
                name="address"
                value={profileData.address}
                onChange={handleInputChange}
                rows={3}
                className="professional-input"
                placeholder="Full company address"
              />
            </div>

            {/* Company Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Company Description
              </label>
              <textarea
                id="description"
                name="description"
                value={profileData.description}
                onChange={handleInputChange}
                rows={4}
                className="professional-input"
                placeholder="Describe your company, mission, values, and what makes you unique..."
              />
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
                    Updating...
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

export default CompanyProfile;