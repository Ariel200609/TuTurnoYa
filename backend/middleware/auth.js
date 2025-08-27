const jwt = require('jsonwebtoken');
const { User, VenueOwner, Admin } = require('../models');

// Middleware to verify JWT token and get user
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó token de autenticación.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user based on type
    let user;
    switch (decoded.type) {
      case 'user':
        user = await User.findByPk(decoded.id);
        if (!user || !user.isActive || !user.isPhoneVerified) {
          return res.status(401).json({
            success: false,
            message: 'Usuario no válido o inactivo'
          });
        }
        break;
        
      case 'venue_owner':
        user = await VenueOwner.findByPk(decoded.id);
        if (!user || !user.isActive) {
          return res.status(401).json({
            success: false,
            message: 'Propietario no válido o inactivo'
          });
        }
        break;
        
      case 'admin':
        user = await Admin.findByPk(decoded.id);
        if (!user || !user.isActive) {
          return res.status(401).json({
            success: false,
            message: 'Administrador no válido o inactivo'
          });
        }
        break;
        
      default:
        return res.status(401).json({
          success: false,
          message: 'Tipo de token inválido'
        });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Add user info to request
    req.user = user;
    req.userType = decoded.type;
    req.userId = user.id;
    
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Por favor, inicia sesión nuevamente.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error de autenticación'
    });
  }
};

// Middleware to check if user is a specific type
const requireUserType = (...types) => {
  return (req, res, next) => {
    if (!req.userType || !types.includes(req.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso no autorizado para este tipo de usuario'
      });
    }
    next();
  };
};

// Middleware to check admin permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (req.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo administradores pueden acceder a este recurso'
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos suficientes para esta acción'
      });
    }

    next();
  };
};

// Middleware to check if venue owner owns the venue
const requireVenueOwnership = async (req, res, next) => {
  try {
    if (req.userType !== 'venue_owner' && req.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo propietarios de venues o administradores pueden acceder'
      });
    }

    // If admin, skip ownership check
    if (req.userType === 'admin') {
      return next();
    }

    const venueId = req.params.venueId || req.params.id || req.body.venueId;
    
    if (!venueId) {
      return res.status(400).json({
        success: false,
        message: 'ID del venue requerido'
      });
    }

    const { Venue } = require('../models');
    const venue = await Venue.findByPk(venueId);
    
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue no encontrado'
      });
    }

    if (venue.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para este venue'
      });
    }

    req.venue = venue;
    next();

  } catch (error) {
    console.error('Venue ownership check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar propiedad del venue'
    });
  }
};

// Middleware for optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to get user
    let user;
    switch (decoded.type) {
      case 'user':
        user = await User.findByPk(decoded.id);
        break;
      case 'venue_owner':
        user = await VenueOwner.findByPk(decoded.id);
        break;
      case 'admin':
        user = await Admin.findByPk(decoded.id);
        break;
    }

    if (user) {
      req.user = user;
      req.userType = decoded.type;
      req.userId = user.id;
    }

    next();

  } catch (error) {
    // If token is invalid, just continue without auth
    next();
  }
};

module.exports = {
  auth,
  requireUserType,
  requirePermission,
  requireVenueOwnership,
  optionalAuth
};
