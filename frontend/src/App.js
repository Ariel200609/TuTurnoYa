import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

// Layout components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import DemoWrapper from './components/Demo/DemoWrapper';

// Pages
import Home from './pages/Home/Home';
import Search from './pages/Search/Search';
import VenueDetails from './pages/VenueDetails/VenueDetails';
import Booking from './pages/Booking/Booking';
import Profile from './pages/Profile/Profile';
import MyBookings from './pages/MyBookings/MyBookings';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Venue Owner pages
import VenueOwnerDashboard from './pages/VenueOwner/Dashboard';
import VenueOwnerVenues from './pages/VenueOwner/Venues';
import VenueOwnerBookings from './pages/VenueOwner/Bookings';
import VenueOwnerLogin from './pages/VenueOwner/Login';
import VenueOwnerRegister from './pages/VenueOwner/Register';

// Admin pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './pages/Admin/Users';
import AdminVenues from './pages/Admin/Venues';
import AdminLogin from './pages/Admin/Login';

// Styles
import GlobalStyles from './styles/GlobalStyles';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Inner App component that has access to theme
const AppContent = () => {
  const { theme } = useTheme();
  
  return (
    <StyledThemeProvider theme={theme}>
      <AuthProvider>
          <Router>
            <GlobalStyles />
            <DemoWrapper>
              <div className="App">
                <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/search" element={<Layout><Search /></Layout>} />
                <Route path="/venue/:id" element={<Layout><VenueDetails /></Layout>} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* User Protected Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute userType="user">
                    <Layout><Profile /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/my-bookings" element={
                  <ProtectedRoute userType="user">
                    <Layout><MyBookings /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/book/:courtId" element={
                  <ProtectedRoute userType="user">
                    <Layout><Booking /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* Venue Owner Routes */}
                <Route path="/venue-owner/login" element={<VenueOwnerLogin />} />
                <Route path="/venue-owner/register" element={<VenueOwnerRegister />} />
                <Route path="/venue-owner/dashboard" element={
                  <ProtectedRoute userType="venue_owner">
                    <VenueOwnerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/venue-owner/venues" element={
                  <ProtectedRoute userType="venue_owner">
                    <VenueOwnerVenues />
                  </ProtectedRoute>
                } />
                <Route path="/venue-owner/bookings" element={
                  <ProtectedRoute userType="venue_owner">
                    <VenueOwnerBookings />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute userType="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute userType="admin">
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="/admin/venues" element={
                  <ProtectedRoute userType="admin">
                    <AdminVenues />
                  </ProtectedRoute>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </DemoWrapper>
            
            {/* Toast notifications */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </Router>
        </AuthProvider>
    </StyledThemeProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
      
      {/* React Query DevTools */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default App;
