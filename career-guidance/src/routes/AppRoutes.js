// Update your App.js to include institution routes AND job portal
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import './App.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './components/student/StudentDashboard';
import InstitutionDashboard from './components/institution/InstitutionDashboard';
import InstitutionList from './components/student/InstitutionList';
import InstitutionCourses from './components/student/InstitutionCourses';
import JobPortal from './components/student/JobPortal';

// Update your App.js ProtectedRoute component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  console.log('🛡️ Protected Route - Full User:', user);
  console.log('🛡️ Protected Route - User role:', user?.userType || user?.role);
  console.log('🛡️ Protected Route - Allowed roles:', allowedRoles);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Get user role - try multiple possible property names
  const userRole = user?.userType || user?.role || 'student'; // Default to student if not set
  
  // Check user role if specific roles are required
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.log('🚫 Access denied - User role not in allowed roles');
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/dashboard" replace />;
};

// App Routes Component
const AppRoutes = () => {
  const { user } = useAuth();

  const getDashboardComponent = () => {
    switch (user?.userType) {
      case 'student':
        return <StudentDashboard />;
      case 'institution':
        return <InstitutionDashboard />;
      case 'company':
        return <div>Company Dashboard - Coming Soon</div>;
      case 'admin':
        return <div>Admin Dashboard - Coming Soon</div>;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      
      {/* Protected routes - Role-based access */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {getDashboardComponent()}
        </ProtectedRoute>
      } />
      
      {/* Student routes */}
      <Route path="/student/apply" element={
        <ProtectedRoute allowedRoles={['student']}>
          <InstitutionList />
        </ProtectedRoute>
      } />
      <Route path="/student/apply/institution/:institutionId" element={
        <ProtectedRoute allowedRoles={['student']}>
          <InstitutionCourses />
        </ProtectedRoute>
      } />
      
      {/* JOB PORTAL ROUTE */}
      <Route path="/jobs" element={
        <ProtectedRoute allowedRoles={['student']}>
          <JobPortal />
        </ProtectedRoute>
      } />
      
      {/* Institution routes */}
      <Route path="/institution/dashboard" element={
        <ProtectedRoute allowedRoles={['institution']}>
          <InstitutionDashboard />
        </ProtectedRoute>
      } />
      
      {/* Default route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <div className="App">
            <AppRoutes />
          </div>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;