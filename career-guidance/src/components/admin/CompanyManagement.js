// src/components/admin/CompanyManagement.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const companiesSnapshot = await getDocs(collection(db, 'users'));
      const companiesData = companiesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.userType === 'company');
      
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const updateCompanyStatus = async (companyId, status) => {
    try {
      const companyRef = doc(db, 'users', companyId);
      await updateDoc(companyRef, { status });
      setCompanies(companies.map(company => 
        company.id === companyId ? { ...company, status } : company
      ));
    } catch (error) {
      console.error('Error updating company status:', error);
    }
  };

  const deleteCompany = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await deleteDoc(doc(db, 'users', companyId));
        setCompanies(companies.filter(company => company.id !== companyId));
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    }
  };

  const filteredCompanies = companies.filter(company => {
    if (filter === 'all') return true;
    return company.status === filter;
  });

  // REMOVED: Unused getStatusBadge function

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading companies...</div>
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
              <h1 className="text-2xl font-bold text-white">Company Management</h1>
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
                All Companies ({companies.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'active' 
                    ? 'btn-professional' 
                    : 'border border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Active ({companies.filter(company => company.status === 'active').length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'pending' 
                    ? 'btn-professional' 
                    : 'border border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Pending ({companies.filter(company => company.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('suspended')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'suspended' 
                    ? 'btn-professional' 
                    : 'border border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Suspended ({companies.filter(company => company.status === 'suspended').length})
              </button>
            </div>
          </div>

          {/* Companies Table */}
          <div className="elegant-card p-6">
            <div className="elegant-table">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left p-4">Company</th>
                    <th className="text-left p-4">Contact</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Industry</th>
                    <th className="text-left p-4">Registered</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company) => (
                    <tr key={company.id} className="border-b border-gray-700">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-purple-900 rounded-full flex items-center justify-center">
                            <span className="text-purple-300 font-medium">
                              {company.companyName?.charAt(0) || 'C'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {company.companyName || 'Unnamed Company'}
                            </div>
                            <div className="text-sm text-gray-400">
                              ID: {company.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-white">{company.email}</div>
                        <div className="text-sm text-gray-400">{company.phone || 'No phone'}</div>
                      </td>
                      <td className="p-4">
                        <select
                          value={company.status || 'pending'}
                          onChange={(e) => updateCompanyStatus(company.id, e.target.value)}
                          className="professional-input text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {company.industry || 'Not specified'}
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="p-4 text-sm font-medium">
                        <button
                          onClick={() => navigate(`/admin/companies/${company.id}`)}
                          className="text-blue-400 hover:text-orange-400"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteCompany(company.id)}
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

          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No companies found</h3>
              <p className="text-gray-400">No companies match the current filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyManagement;