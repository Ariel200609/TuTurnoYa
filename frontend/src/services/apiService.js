import axios from 'axios';

// Para GitHub Pages, usar solo modo demo
const API_URL = process.env.REACT_APP_API_URL || null; // En GitHub Pages no hay backend

// Create axios instance solo si hay API_URL
const api = API_URL ? axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
}) : null;

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeUser('userType');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const apiService = {
  // VENUES
  venues: {
    // Get all venues with filters
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      return await api.get(`/venues?${params.toString()}`);
    },

    // Get single venue
    getById: async (id) => {
      return await api.get(`/venues/${id}`);
    },

    // Create venue (venue owner)
    create: async (venueData) => {
      return await api.post('/venues', venueData);
    },

    // Update venue (venue owner)
    update: async (id, venueData) => {
      return await api.put(`/venues/${id}`, venueData);
    },

    // Upload venue images
    uploadImages: async (id, images) => {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });
      return await api.post(`/venues/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },

    // Delete venue image
    deleteImage: async (id, imageUrl) => {
      return await api.delete(`/venues/${id}/images`, { data: { imageUrl } });
    },

    // Get venue availability
    getAvailability: async (id, date, duration) => {
      const params = new URLSearchParams({ date });
      if (duration) params.append('duration', duration);
      return await api.get(`/venues/${id}/availability?${params.toString()}`);
    },

    // Get venue reviews
    getReviews: async (id, options = {}) => {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value);
      });
      return await api.get(`/venues/${id}/reviews?${params.toString()}`);
    }
  },

  // COURTS
  courts: {
    // Get courts for venue
    getByVenue: async (venueId) => {
      return await api.get(`/courts/venue/${venueId}`);
    },

    // Get single court
    getById: async (id) => {
      return await api.get(`/courts/${id}`);
    },

    // Create court
    create: async (courtData) => {
      return await api.post('/courts', courtData);
    },

    // Update court
    update: async (id, courtData) => {
      return await api.put(`/courts/${id}`, courtData);
    },

    // Delete court
    delete: async (id) => {
      return await api.delete(`/courts/${id}`);
    },

    // Get court availability
    getAvailability: async (id, startDate, endDate, duration) => {
      const params = new URLSearchParams({ startDate });
      if (endDate) params.append('endDate', endDate);
      if (duration) params.append('duration', duration);
      return await api.get(`/courts/${id}/availability?${params.toString()}`);
    },

    // Calculate pricing
    calculatePricing: async (id, date, startTime, duration) => {
      return await api.post(`/courts/${id}/pricing`, { date, startTime, duration });
    },

    // Upload court images
    uploadImages: async (id, images) => {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });
      return await api.post(`/courts/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },

    // Toggle maintenance mode
    setMaintenance: async (id, maintenanceMode, reason) => {
      return await api.put(`/courts/${id}/maintenance`, { maintenanceMode, reason });
    }
  },

  // BOOKINGS
  bookings: {
    // Get all bookings for current user/venue owner
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value);
        }
      });
      return await api.get(`/bookings?${params.toString()}`);
    },

    // Get single booking
    getById: async (id) => {
      return await api.get(`/bookings/${id}`);
    },

    // Create booking (user)
    create: async (bookingData) => {
      return await api.post('/bookings', bookingData);
    },

    // Confirm booking (venue owner)
    confirm: async (id) => {
      return await api.put(`/bookings/${id}/confirm`);
    },

    // Reject booking (venue owner)
    reject: async (id, reason) => {
      return await api.put(`/bookings/${id}/reject`, { reason });
    },

    // Cancel booking
    cancel: async (id, reason) => {
      return await api.put(`/bookings/${id}/cancel`, { reason });
    },

    // Check in to booking (venue owner)
    checkIn: async (id) => {
      return await api.post(`/bookings/${id}/checkin`);
    },

    // Mark booking as completed (venue owner)
    complete: async (id) => {
      return await api.put(`/bookings/${id}/complete`);
    }
  },

  // USERS
  users: {
    // Get user profile
    getProfile: async () => {
      return await api.get('/users/profile');
    },

    // Update user profile
    updateProfile: async (userData) => {
      return await api.put('/users/profile', userData);
    },

    // Upload profile image
    uploadImage: async (image) => {
      const formData = new FormData();
      formData.append('profileImage', image);
      return await api.post('/users/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },

    // Get user bookings
    getBookings: async (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value);
        }
      });
      return await api.get(`/users/bookings?${params.toString()}`);
    },

    // Get user reviews
    getReviews: async () => {
      return await api.get('/users/reviews');
    },

    // Get user favorites
    getFavorites: async () => {
      return await api.get('/users/favorites');
    },

    // Add venue to favorites
    addFavorite: async (venueId) => {
      return await api.post(`/users/favorites/${venueId}`);
    },

    // Remove venue from favorites
    removeFavorite: async (venueId) => {
      return await api.delete(`/users/favorites/${venueId}`);
    },

    // Get user statistics
    getStats: async () => {
      return await api.get('/users/stats');
    }
  },

  // REVIEWS
  reviews: {
    // Create review
    create: async (reviewData) => {
      return await api.post('/reviews', reviewData);
    },

    // Update review
    update: async (id, reviewData) => {
      return await api.put(`/reviews/${id}`, reviewData);
    },

    // Delete review
    delete: async (id) => {
      return await api.delete(`/reviews/${id}`);
    },

    // Vote on review helpfulness
    vote: async (id, helpful) => {
      return await api.post(`/reviews/${id}/vote`, { helpful });
    }
  },

  // NOTIFICATIONS
  notifications: {
    // Get notifications
    getAll: async (options = {}) => {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value);
      });
      return await api.get(`/notifications?${params.toString()}`);
    },

    // Mark notification as read
    markRead: async (id) => {
      return await api.put(`/notifications/${id}/read`);
    },

    // Mark all notifications as read
    markAllRead: async () => {
      return await api.put('/notifications/read-all');
    }
  },

  // ADMIN
  admin: {
    // Get dashboard stats
    getDashboard: async () => {
      return await api.get('/admin/dashboard');
    },

    // Get users
    getUsers: async (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value);
        }
      });
      return await api.get(`/admin/users?${params.toString()}`);
    },

    // Get venues
    getVenues: async (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value);
        }
      });
      return await api.get(`/admin/venues?${params.toString()}`);
    },

    // Verify venue
    verifyVenue: async (id) => {
      return await api.put(`/admin/venues/${id}/verify`);
    }
  },

  // SEARCH & FILTERS
  search: {
    // Search venues
    venues: async (query, filters = {}) => {
      const params = new URLSearchParams({ search: query });
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value);
        }
      });
      return await api.get(`/venues?${params.toString()}`);
    },

    // Get available time slots
    getAvailableSlots: async (courtId, date) => {
      return await api.get(`/courts/${courtId}/availability`, {
        params: { startDate: date, endDate: date }
      });
    }
  },

  // UTILS
  utils: {
    // Health check
    healthCheck: async () => {
      return await api.get('/health');
    },

    // Demo login for quick testing
    demoLogin: async (email, userType) => {
      return await api.post('/auth/demo-login', { email, type: userType });
    },

    // Get app configuration
    getConfig: async () => {
      // This could return app-wide configuration
      return {
        supportedCities: ['Bahía Blanca', 'Buenos Aires', 'La Plata'],
        courtTypes: ['Fútbol 5', 'Fútbol 7', 'Fútbol 8', 'Fútbol 11', 'Futsal'],
        surfaceTypes: ['Césped Sintético', 'Césped Natural', 'Cemento'],
        maxBookingDays: 30,
        minBookingDuration: 60,
        maxBookingDuration: 180
      };
    }
  }
};

export default apiService;
