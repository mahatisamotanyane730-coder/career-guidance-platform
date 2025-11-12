import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/common/Layout';
import './App.css';

// Pages
import Home from './pages/Home'; // ✅ ADD THIS - New Home page
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './components/student/StudentDashboard';
import InstitutionDashboard from './components/institution/InstitutionDashboard';
import InstitutionList from './components/student/InstitutionList';
import InstitutionCourses from './components/student/InstitutionCourses';
import JobPortal from './components/student/JobPortal';

// ✅ ADD THIS MISSING IMPORT
import ApplicationStatus from './components/student/ApplicationStatus';

// Institution Components
import StudentApplications from './components/institution/StudentApplications';
import CourseManagement from './components/institution/CourseManagement';
import FacultyManagement from './components/institution/FacultyManagement';
import InstitutionProfile from './components/institution/InstitutionProfile';

// Company Components
import CompanyDashboard from './components/company/CompanyDashboard';
import ApplicantsList from './components/company/ApplicantsList';
import JobPosting from './components/company/JobPosting';
import CompanyProfile from './components/company/CompanyProfile';
import CandidateProfile from './components/company/CandidateProfile';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import Analytics from './components/admin/Analytics';
import SystemReports from './components/admin/SystemReports';
import InstitutionManagement from './components/admin/InstitutionManagement';
import CompanyManagement from './components/admin/CompanyManagement';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
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

  const userRole = user.userType || user.role;
  
  if (allowedRoles.length === 0) {
    return children;
  }
  
  if (!userRole && allowedRoles.length > 0) {
    const email = user.email || '';
    let determinedRole = 'student';
    
    if (email.includes('institution')) determinedRole = 'institution';
    if (email.includes('company')) determinedRole = 'company';
    if (email.includes('admin')) determinedRole = 'admin';
    
    if (allowedRoles.includes(determinedRole)) {
      return children;
    }
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
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
    const userRole = user?.userType || user?.role;
    
    let effectiveRole = userRole;
    if (!effectiveRole && user?.email) {
      const email = user.email;
      if (email.includes('institution')) effectiveRole = 'institution';
      else if (email.includes('company')) effectiveRole = 'company';
      else if (email.includes('admin')) effectiveRole = 'admin';
      else effectiveRole = 'student';
    }
    
    switch (effectiveRole?.toLowerCase()) {
      case 'student':
        return <StudentDashboard />;
      case 'institution':
        return <InstitutionDashboard />;
      case 'company':
        return <CompanyDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <Routes>
      {/* ✅ HOME PAGE - Public accessible to all */}
      <Route path="/" element={<Home />} />
      
      {/* Public routes without footer */}
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
      
      {/* All other routes with footer */}
      <Route path="*" element={
        <Layout>
          <Routes>
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
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            
            {/* ✅ ADD THIS MISSING ROUTE FOR "VIEW MY APPLICATIONS" */}
            <Route path="/student/applications" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ApplicationStatus />
              </ProtectedRoute>
            } />
            
            {/* Job Portal Route */}
            <Route path="/jobs" element={
              <ProtectedRoute allowedRoles={['student']}>
                <JobPortal />
              </ProtectedRoute>
            } />
            
            {/* INSTITUTION ROUTES */}
            <Route path="/institution/dashboard" element={
              <ProtectedRoute allowedRoles={['institution']}>
                <InstitutionDashboard />
              </ProtectedRoute>
            } />
            <Route path="/institution/applications" element={
              <ProtectedRoute allowedRoles={['institution']}>
                <StudentApplications />
              </ProtectedRoute>
            } />
            <Route path="/institution/courses" element={
              <ProtectedRoute allowedRoles={['institution']}>
                <CourseManagement />
              </ProtectedRoute>
            } />
            <Route path="/institution/faculties" element={
              <ProtectedRoute allowedRoles={['institution']}>
                <FacultyManagement />
              </ProtectedRoute>
            } />
            <Route path="/institution/profile" element={
              <ProtectedRoute allowedRoles={['institution']}>
                <InstitutionProfile />
              </ProtectedRoute>
            } />
            
            {/* COMPANY ROUTES */}
            <Route path="/company/dashboard" element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyDashboard />
              </ProtectedRoute>
            } />
            <Route path="/company/applications" element={
              <ProtectedRoute allowedRoles={['company']}>
                <ApplicantsList />
              </ProtectedRoute>
            } />
            <Route path="/company/applications/candidate/:candidateId" element={
              <ProtectedRoute allowedRoles={['company']}>
                <CandidateProfile />
              </ProtectedRoute>
            } />
            <Route path="/company/jobs" element={
              <ProtectedRoute allowedRoles={['company']}>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Job Management</h1>
                  <p>Job management features coming soon...</p>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/company/jobs/new" element={
              <ProtectedRoute allowedRoles={['company']}>
                <JobPosting />
              </ProtectedRoute>
            } />
            <Route path="/company/profile" element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyProfile />
              </ProtectedRoute>
            } />
            
            {/* ADMIN ROUTES */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SystemReports />
              </ProtectedRoute>
            } />
            <Route path="/admin/institutions" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <InstitutionManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/companies" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CompanyManagement />
              </ProtectedRoute>
            } />
            
            {/* 404 route */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-xl text-gray-600">Page not found</p>
                </div>
              </div>
            } />
          </Routes>
        </Layout>
      } />
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