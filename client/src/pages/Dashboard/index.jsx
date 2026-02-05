import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SeekerDashboard from './SeekerDashboard';
import EmployerDashboard from './EmployerDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role === 'jobSeeker') {
    return <SeekerDashboard />;
  }

  if (user.role === 'employer') {
    return <EmployerDashboard />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <Navigate to="/" />;
};

export default Dashboard;
