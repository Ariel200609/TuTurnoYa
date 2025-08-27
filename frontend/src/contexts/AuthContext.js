import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import { demoUsers } from '../data/demoData';

// Initial state
const initialState = {
  user: null,
  userType: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
const AuthActionTypes = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null
      };
      
    case AuthActionTypes.LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('userType', action.payload.userType);
      return {
        ...state,
        user: action.payload.user,
        userType: action.payload.userType,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
      
    case AuthActionTypes.LOGOUT:
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      return {
        ...state,
        user: null,
        userType: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
      
    case AuthActionTypes.UPDATE_USER:
      return {
        ...state,
        user: action.payload
      };
      
    case AuthActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
      
    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token || !userType) {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      return;
    }

    try {
      const response = await authService.getCurrentUser();
      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          userType: response.userType,
          token
        }
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token is invalid, remove it
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      dispatch({ type: AuthActionTypes.LOGOUT });
    }
  };

  // Send SMS verification code
  const sendVerificationCode = async (phoneNumber) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });

    try {
      await authService.sendVerificationCode(phoneNumber);
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      toast.success('Código de verificación enviado');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al enviar código';
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Verify phone and login/register
  const verifyPhone = async (phoneNumber, verificationCode, firstName, lastName) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });

    try {
      const response = await authService.verifyPhone({
        phoneNumber,
        verificationCode,
        firstName,
        lastName
      });

      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          userType: 'user',
          token: response.token
        }
      });

      toast.success('¡Bienvenido a TuTurnoYa! ⚽');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error en la verificación';
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Venue Owner login
  const venueOwnerLogin = async (email, password) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });

    try {
      const response = await authService.venueOwnerLogin(email, password);
      
      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: {
          user: response.venueOwner,
          userType: 'venue_owner',
          token: response.token
        }
      });

      toast.success('¡Bienvenido de vuelta!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Venue Owner register
  const venueOwnerRegister = async (userData) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });

    try {
      const response = await authService.venueOwnerRegister(userData);
      
      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: {
          user: response.venueOwner,
          userType: 'venue_owner',
          token: response.token
        }
      });

      toast.success('¡Cuenta creada exitosamente!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear cuenta';
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Admin login
  const adminLogin = async (email, password) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });

    try {
      const response = await authService.adminLogin(email, password);
      
      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: {
          user: response.admin,
          userType: 'admin',
          token: response.token
        }
      });

      toast.success('Acceso administrativo autorizado');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: AuthActionTypes.LOGOUT });
    toast.info('Sesión cerrada');
  };

  // Update user profile
  const updateUser = (updatedUser) => {
    dispatch({ type: AuthActionTypes.UPDATE_USER, payload: updatedUser });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  };

  const value = {
    // State
    user: state.user,
    userType: state.userType,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    sendVerificationCode,
    verifyPhone,
    venueOwnerLogin,
    venueOwnerRegister,
    adminLogin,
    logout,
    updateUser,
    clearError,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
