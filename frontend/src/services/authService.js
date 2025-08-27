import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  // USER AUTHENTICATION
  
  // Send SMS verification code
  sendVerificationCode: async (phoneNumber) => {
    return await api.post('/auth/send-verification', { phoneNumber });
  },

  // Verify phone number and login/register
  verifyPhone: async (data) => {
    return await api.post('/auth/verify-phone', data);
  },

  // VENUE OWNER AUTHENTICATION
  
  // Venue owner login
  venueOwnerLogin: async (email, password) => {
    return await api.post('/auth/venue-owner/login', { email, password });
  },

  // Venue owner registration
  venueOwnerRegister: async (userData) => {
    return await api.post('/auth/venue-owner/register', userData);
  },

  // ADMIN AUTHENTICATION
  
  // Admin login
  adminLogin: async (email, password) => {
    return await api.post('/auth/admin/login', { email, password });
  },

  // SHARED METHODS
  
  // Get current user profile
  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  // Refresh token
  refreshToken: async () => {
    return await api.post('/auth/refresh');
  },

  // Logout (client-side only, just remove token)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    return !!(token && userType);
  },

  // Get current user type
  getUserType: () => {
    return localStorage.getItem('userType');
  },

  // Get current token
  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;
