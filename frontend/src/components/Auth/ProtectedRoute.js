import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';

const ProtectedRoute = ({ children, userType, allowedUserTypes = [] }) => {
  const { isAuthenticated, isLoading, user, userType: currentUserType } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check user type if specified
  if (userType && currentUserType !== userType) {
    // Redirect to appropriate dashboard based on current user type
    switch (currentUserType) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'venue_owner':
        return <Navigate to="/venue-owner/dashboard" replace />;
      case 'user':
        return <Navigate to="/profile" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Check if user type is in allowed list
  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(currentUserType)) {
    // Redirect to home or appropriate page
    return <Navigate to="/" replace />;
  }

  // Render children if all checks pass
  return children;
};

export default ProtectedRoute;
