import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import StudentDashboard from '../components/student/StudentDashboard';
import AdminDashboard from '../components/admin/AdminDashboard';
import InstitutionDashboard from '../components/institution/InstitutionDashboard';
import CompanyDashboard from '../components/company/CompanyDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Please log in to view your dashboard</div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'institution':
      return <InstitutionDashboard />;
    case 'company':
      return <CompanyDashboard />;
    default:
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Unknown user role</div>
        </div>
      );
  }
};

export default Dashboard;