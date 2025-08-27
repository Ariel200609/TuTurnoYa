import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DemoLogin from '../../components/Demo/DemoLogin';

const AdminLogin = () => {
  const { isAuthenticated, userType } = useAuth();

  if (isAuthenticated && userType === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <DemoLogin />;
};

export default AdminLogin;
