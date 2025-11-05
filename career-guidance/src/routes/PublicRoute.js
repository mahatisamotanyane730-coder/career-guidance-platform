import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If user is already logged in, redirect to their dashboard
  if (user) {
    switch (user.role) {
      case 'student':
        return <Navigate to="/student/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'institution':
        return <Navigate to="/institution/dashboard" replace />;
      case 'company':
        return <Navigate to="/company/dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default PublicRoute;