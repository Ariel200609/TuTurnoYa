const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const twilio = require('twilio');
// Import models and auth only if not in demo mode
let User, VenueOwner, Admin, auth;
try {
  const models = require('../models');
  User = models.User;
  VenueOwner = models.VenueOwner; 
  Admin = models.Admin;
  auth = require('../middleware/auth').auth;
} catch (error) {
  console.log('⚠️  Modelos no disponibles - usando modo demo');
  // Mock auth middleware for demo
  auth = (req, res, next) => {
    req.user = { id: '1' };
    req.userType = 'user';
    next();
  };
}
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Initialize Firebase Admin only if configured (not in demo mode)
if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
      }),
    });
    console.log('✅ Firebase Admin inicializado');
  } catch (error) {
    console.log('⚠️  Firebase no configurado - usando modo demo');
  }
} else {
  console.log('🎯 Ejecutando sin Firebase - modo demo activado');
}

// Initialize Twilio only if configured
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio inicializado');
  } catch (error) {
    console.log('⚠️  Twilio no configurado - SMS en modo demo');
  }
} else {
  console.log('🎯 SMS en modo demo - sin Twilio');
}

// Rate limiting for SMS
const smsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 SMS requests per windowMs
  message: 'Demasiados intentos de envío de SMS, intenta nuevamente en 15 minutos'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth attempts per windowMs
  message: 'Demasiados intentos de autenticación, intenta nuevamente en 15 minutos'
});

// Generate JWT token
const generateToken = (user, type = 'user') => {
  return jwt.sign(
    { 
      id: user.id, 
      type,
      phoneNumber: user.phoneNumber || user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// USER AUTHENTICATION ROUTES

// @route   POST /api/auth/send-verification
// @desc    Send SMS verification code
// @access  Public
router.post('/send-verification', [
  smsLimiter,
  body('phoneNumber')
    .isMobilePhone('any')
    .withMessage('Número de teléfono válido requerido')
    .customSanitizer((value) => {
      // Normalize phone number format
      if (value.startsWith('0')) {
        return '+54' + value.substring(1);
      }
      if (!value.startsWith('+')) {
        return '+54' + value;
      }
      return value;
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const { phoneNumber } = req.body;

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if user exists
    let user = await User.findByPhoneNumber(phoneNumber);
    
    if (!user) {
      // Create temporary user record
      user = await User.create({
        phoneNumber,
        firstName: 'Usuario',
        lastName: 'Temporal',
        verificationCode,
        verificationCodeExpiry: expiryTime,
        isPhoneVerified: false
      });
    } else {
      // Update existing user with new code
      user.verificationCode = verificationCode;
      user.verificationCodeExpiry = expiryTime;
      await user.save();
    }

    // Send SMS via Twilio (or simulate in demo mode)
    if (twilioClient && process.env.NODE_ENV === 'production') {
      await twilioClient.messages.create({
        body: `TuTurnoYa: Tu código de verificación es ${verificationCode}. Válido por 10 minutos.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      console.log(`✅ SMS enviado a ${phoneNumber}`);
    } else {
      console.log(`🎯 MODO DEMO - Código para ${phoneNumber}: ${verificationCode}`);
    }

    res.json({
      success: true,
      message: 'Código de verificación enviado',
      phoneNumber: phoneNumber.replace(/(\+54)(\d{3})(\d{3})(\d{4})/, '$1 $2 ****$4') // Mask phone number
    });

  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar código de verificación'
    });
  }
});

// @route   POST /api/auth/verify-phone
// @desc    Verify SMS code and login/register user
// @access  Public
router.post('/verify-phone', [
  authLimiter,
  body('phoneNumber').isMobilePhone('any').withMessage('Número de teléfono válido requerido'),
  body('verificationCode').isLength({ min: 6, max: 6 }).withMessage('Código de verificación inválido'),
  body('firstName').optional().isLength({ min: 2, max: 50 }).withMessage('Nombre debe tener entre 2 y 50 caracteres'),
  body('lastName').optional().isLength({ min: 2, max: 50 }).withMessage('Apellido debe tener entre 2 y 50 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const { phoneNumber, verificationCode, firstName, lastName } = req.body;

    // Find user with verification code
    const user = await User.findOne({
      where: {
        phoneNumber,
        verificationCode,
        verificationCodeExpiry: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Código de verificación inválido o expirado'
      });
    }

    // Update user profile if this is a new registration
    if (firstName && lastName && user.firstName === 'Usuario' && user.lastName === 'Temporal') {
      user.firstName = firstName;
      user.lastName = lastName;
    }

    // Mark phone as verified and clear verification code
    user.isPhoneVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user, 'user');

    res.json({
      success: true,
      message: 'Verificación exitosa',
      token,
      user: user.toSafeJSON()
    });

  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error en la verificación'
    });
  }
});

// VENUE OWNER AUTHENTICATION ROUTES

// @route   POST /api/auth/venue-owner/register
// @desc    Register venue owner
// @access  Public
router.post('/venue-owner/register', [
  authLimiter,
  body('email').isEmail().withMessage('Email válido requerido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('firstName').isLength({ min: 2, max: 50 }).withMessage('Nombre requerido'),
  body('lastName').isLength({ min: 2, max: 50 }).withMessage('Apellido requerido'),
  body('businessName').isLength({ min: 3, max: 100 }).withMessage('Nombre del negocio requerido'),
  body('phoneNumber').isMobilePhone('any').withMessage('Teléfono válido requerido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, businessName, phoneNumber, businessType, taxId } = req.body;

    // Check if venue owner already exists
    const existingOwner = await VenueOwner.findByEmail(email);
    if (existingOwner) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una cuenta con este email'
      });
    }

    // Create new venue owner
    const venueOwner = await VenueOwner.create({
      email,
      password,
      firstName,
      lastName,
      businessName,
      phoneNumber,
      businessType: businessType || 'Complejo Deportivo',
      taxId: taxId || null,
      commissionRate: parseFloat(process.env.DEFAULT_COMMISSION_RATE) || 0.1
    });

    // Generate JWT token
    const token = generateToken(venueOwner, 'venue_owner');

    res.status(201).json({
      success: true,
      message: 'Cuenta de propietario creada exitosamente',
      token,
      venueOwner: venueOwner.toSafeJSON()
    });

  } catch (error) {
    console.error('Venue owner registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cuenta'
    });
  }
});

// @route   POST /api/auth/venue-owner/login
// @desc    Login venue owner
// @access  Public
router.post('/venue-owner/login', [
  authLimiter,
  body('email').isEmail().withMessage('Email válido requerido'),
  body('password').notEmpty().withMessage('Contraseña requerida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find venue owner
    const venueOwner = await VenueOwner.findByEmail(email);
    if (!venueOwner) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Check if account is active
    if (!venueOwner.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada. Contacta al soporte.'
      });
    }

    // Verify password
    const isPasswordValid = await venueOwner.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Update last login
    venueOwner.lastLoginAt = new Date();
    await venueOwner.save();

    // Generate JWT token
    const token = generateToken(venueOwner, 'venue_owner');

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      venueOwner: venueOwner.toSafeJSON()
    });

  } catch (error) {
    console.error('Venue owner login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión'
    });
  }
});

// ADMIN AUTHENTICATION ROUTES

// @route   POST /api/auth/admin/login
// @desc    Login admin
// @access  Public
router.post('/admin/login', [
  authLimiter,
  body('email').isEmail().withMessage('Email válido requerido'),
  body('password').notEmpty().withMessage('Contraseña requerida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find admin
    const adminUser = await Admin.findByEmail(email);
    if (!adminUser) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Check if account is locked
    if (adminUser.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Cuenta bloqueada temporalmente por múltiples intentos fallidos'
      });
    }

    // Verify password
    const isPasswordValid = await adminUser.comparePassword(password);
    if (!isPasswordValid) {
      await adminUser.incrementLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Reset login attempts and update last login
    await adminUser.resetLoginAttempts();

    // Generate JWT token
    const token = generateToken(adminUser, 'admin');

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      admin: adminUser.toSafeJSON()
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión'
    });
  }
});

// SHARED ROUTES

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private  
router.get('/me', auth, async (req, res) => {
  try {
    // In demo mode, return mock user data
    if (!User) {
      const mockUsers = {
        '1': { id: '1', firstName: 'Juan', lastName: 'Demo', email: 'user@demo.com', type: 'user' },
        '2': { id: '2', firstName: 'María', lastName: 'Propietaria', email: 'owner@demo.com', type: 'venue_owner' },
        '3': { id: '3', firstName: 'Carlos', lastName: 'Admin', email: 'admin@demo.com', type: 'admin' }
      };
      
      const user = mockUsers[req.user.id] || mockUsers['1'];
      return res.json({
        success: true,
        user,
        userType: user.type
      });
    }

    // Normal database mode
    let user;
    switch (req.userType) {
      case 'user':
        user = await User.findByPk(req.user.id);
        break;
      case 'venue_owner':
        user = await VenueOwner.findByPk(req.user.id);
        break;
      case 'admin':
        user = await Admin.findByPk(req.user.id);
        break;
      default:
        return res.status(401).json({
          success: false,
          message: 'Tipo de usuario inválido'
        });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user: user.toSafeJSON ? user.toSafeJSON() : user,
      userType: req.userType
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', auth, async (req, res) => {
  try {
    // Generate new token
    const token = generateToken(req.user, req.userType);

    res.json({
      success: true,
      token
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al renovar token'
    });
  }
});

module.exports = router;
