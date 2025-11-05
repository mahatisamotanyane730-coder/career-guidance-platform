// src/components/admin/UserManagement.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const updateUserStatus = async (userId, status) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { status });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status } : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.userType === filter;
  });

  const getUserTypeBadge = (userType) => {
    const typeConfig = {
      student: { color: 'bg-blue-500 text-white', label: 'Student' },
      institution: { color: 'bg-green-500 text-black', label: 'Institution' },
      company: { color: 'bg-purple-500 text-white', label: 'Company' },
      admin: { color: 'bg-red-500 text-white', label: 'Admin' }
    };
    
    const config = typeConfig[userType] || { color: 'bg-gray-500 text-white', label: userType };
    return (
      <span className={`status-badge ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // REMOVED: Unused getStatusBadge function

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading users...</div>
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
              <h1 className="text-2xl font-bold text-white">User Management</h1>
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
                All Users ({users.length})
              </button>
              <button
                onClick={() => setFilter('student')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'student' 
                    ? 'btn-professional' 
                    : 'border border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Students ({users.filter(u => u.userType === 'student').length})
              </button>
              <button
                onClick={() => setFilter('institution')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'institution' 
                    ? 'btn-professional' 
                    : 'border border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Institutions ({users.filter(u => u.userType === 'institution').length})
              </button>
              <button
                onClick={() => setFilter('company')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'company' 
                    ? 'btn-professional' 
                    : 'border border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Companies ({users.filter(u => u.userType === 'company').length})
              </button>
              <button
                onClick={() => setFilter('admin')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'admin' 
                    ? 'btn-professional' 
                    : 'border border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Admins ({users.filter(u => u.userType === 'admin').length})
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="elegant-card p-6">
            <div className="elegant-table">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left p-4">User</th>
                    <th className="text-left p-4">Type</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Registered</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-gray-300 font-medium">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-400">
                              ID: {user.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getUserTypeBadge(user.userType)}
                      </td>
                      <td className="p-4">
                        <select
                          value={user.status || 'active'}
                          onChange={(e) => updateUserStatus(user.id, e.target.value)}
                          className="professional-input text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {user.email}
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="p-4 text-sm font-medium">
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-400 hover:text-orange-400"
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
              <p className="text-gray-400">No users match the current filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;