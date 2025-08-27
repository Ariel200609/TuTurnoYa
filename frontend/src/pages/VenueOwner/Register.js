import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DemoLogin from '../../components/Demo/DemoLogin';

const VenueOwnerRegister = () => {
  const { isAuthenticated, userType } = useAuth();

  if (isAuthenticated && userType === 'venue_owner') {
    return <Navigate to="/venue-owner/dashboard" replace />;
  }

  return <DemoLogin />;
};

export default VenueOwnerRegister;
