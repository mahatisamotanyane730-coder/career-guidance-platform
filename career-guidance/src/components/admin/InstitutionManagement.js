// src/components/admin/InstitutionManagement.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const InstitutionManagement = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const institutionsSnapshot = await getDocs(collection(db, 'users'));
      const institutionsData = institutionsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.userType === 'institution');
      
      setInstitutions(institutionsData);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const updateInstitutionStatus = async (institutionId, status) => {
    try {
      const institutionRef = doc(db, 'users', institutionId);
      await updateDoc(institutionRef, { status });
      setInstitutions(institutions.map(inst => 
        inst.id === institutionId ? { ...inst, status } : inst
      ));
    } catch (error) {
      console.error('Error updating institution status:', error);
    }
  };

  const deleteInstitution = async (institutionId) => {
    if (window.confirm('Are you sure you want to delete this institution?')) {
      try {
        await deleteDoc(doc(db, 'users', institutionId));
        setInstitutions(institutions.filter(inst => inst.id !== institutionId));
      } catch (error) {
        console.error('Error deleting institution:', error);
      }
    }
  };

  const filteredInstitutions = institutions.filter(inst => {
    if (filter === 'all') return true;
    return inst.status === filter;
  });

  // REMOVED: Unused getStatusBadge function

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading institutions...</div>
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
                to="/admin/dashboard"
                className="text-blue-300 hover:text-orange-400 flex items-center"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">Institution Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {user?.firstName || 'Admin'}</span>
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
          {/* Filters */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'all' 
                    ? 'btn-professional' 
                    : 'border border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                All Institutions ({institutions.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'active' 
                    ? 'btn-professional' 
                    : 'border border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Active ({institutions.filter(inst => inst.status === 'active').length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'pending' 
                    ? 'btn-professional' 
                    : 'border border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Pending ({institutions.filter(inst => inst.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('suspended')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'suspended' 
                    ? 'btn-professional' 
                    : 'border border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Suspended ({institutions.filter(inst => inst.status === 'suspended').length})
              </button>
            </div>
          </div>

          {/* Institutions Table */}
          <div className="elegant-card p-6">
            <div className="elegant-table">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left p-4">Institution</th>
                    <th className="text-left p-4">Contact</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Location</th>
                    <th className="text-left p-4">Registered</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInstitutions.map((institution) => (
                    <tr key={institution.id} className="border-b border-gray-700">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-green-900 rounded-full flex items-center justify-center">
                            <span className="text-green-300 font-medium">
                              {institution.institutionName?.charAt(0) || 'I'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {institution.institutionName || 'Unnamed Institution'}
                            </div>
                            <div className="text-sm text-gray-400">
                              ID: {institution.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-white">{institution.email}</div>
                        <div className="text-sm text-gray-400">{institution.phone || 'No phone'}</div>
                      </td>
                      <td className="p-4">
                        <select
                          value={institution.status || 'pending'}
                          onChange={(e) => updateInstitutionStatus(institution.id, e.target.value)}
                          className="professional-input text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {institution.address || 'Not specified'}
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {institution.createdAt ? new Date(institution.createdAt).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="p-4 text-sm font-medium">
                        <button
                          onClick={() => navigate(`/admin/institutions/${institution.id}`)}
                          className="text-blue-400 hover:text-orange-400"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteInstitution(institution.id)}
                          className="text-red-400 hover:text-orange-400 ml-4"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredInstitutions.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No institutions found</h3>
              <p className="text-gray-400">No institutions match the current filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstitutionManagement;