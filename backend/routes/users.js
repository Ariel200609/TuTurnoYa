const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Booking, Review, Venue, Court } = require('../models');
const { auth, requireUserType, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private (User only)
router.get('/profile', [auth, requireUserType('user')], async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['verificationCode', 'verificationCodeExpiry', 'firebaseUid'] }
    });

    res.json({
      success: true,
      user: user.toSafeJSON()
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private (User only)
router.put('/profile', [
  auth,
  requireUserType('user'),
  body('firstName').optional().isLength({ min: 2, max: 50 }).withMessage('Nombre debe tener entre 2 y 50 caracteres'),
  body('lastName').optional().isLength({ min: 2, max: 50 }).withMessage('Apellido debe tener entre 2 y 50 caracteres'),
  body('email').optional().isEmail().withMessage('Email válido requerido'),
  body('preferredPosition').optional().isIn(['Arquero', 'Defensor', 'Mediocampista', 'Delantero', 'Sin Preferencia']).withMessage('Posición inválida'),
  body('skillLevel').optional().isIn(['Principiante', 'Intermedio', 'Avanzado', 'Profesional']).withMessage('Nivel inválido')
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

    const { firstName, lastName, email, preferredPosition, skillLevel } = req.body;
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [require('sequelize').Op.ne]: req.user.id }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Este email ya está en uso'
        });
      }
    }

    // Update user profile
    await req.user.update({
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      email: email || req.user.email,
      preferredPosition: preferredPosition || req.user.preferredPosition,
      skillLevel: skillLevel || req.user.skillLevel
    });

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: req.user.toSafeJSON()
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil'
    });
  }
});

// @route   POST /api/users/profile/image
// @desc    Upload user profile image
// @access  Private (User only)
router.post('/profile/image', [
  auth,
  requireUserType('user'),
  upload.single('profileImage')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Imagen requerida'
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'tuturno-ya/users',
          public_id: `user_${req.user.id}_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Update user profile image
    await req.user.update({
      profileImage: result.secure_url
    });

    res.json({
      success: true,
      message: 'Imagen de perfil actualizada',
      profileImage: result.secure_url
    });

  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imagen'
    });
  }
});

// @route   GET /api/users/bookings
// @desc    Get user bookings
// @access  Private (User only)
router.get('/bookings', [auth, requireUserType('user')], async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const bookings = await Booking.findAndCountAll({
      where,
      include: [
        {
          model: Court,
          as: 'court',
          include: [
            {
              model: Venue,
              as: 'venue',
              attributes: ['id', 'name', 'address', 'mainImage', 'phoneNumber']
            }
          ]
        }
      ],
      order: [['bookingDate', 'DESC'], ['startTime', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Group bookings by status for summary
    const statusCounts = await Booking.findAll({
      where: { userId: req.user.id },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const summary = statusCounts.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});

    res.json({
      success: true,
      bookings: bookings.rows,
      pagination: {
        total: bookings.count,
        page: parseInt(page),
        pages: Math.ceil(bookings.count / limit),
        limit: parseInt(limit)
      },
      summary
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reservas'
    });
  }
});

// @route   GET /api/users/bookings/:id
// @desc    Get specific booking details
// @access  Private (User only)
router.get('/bookings/:id', [auth, requireUserType('user')], async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        {
          model: Court,
          as: 'court',
          include: [
            {
              model: Venue,
              as: 'venue',
              attributes: ['id', 'name', 'address', 'neighborhood', 'city', 'phoneNumber', 'email', 'mainImage', 'amenities', 'operatingHours']
            }
          ]
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles de la reserva'
    });
  }
});

// @route   GET /api/users/reviews
// @desc    Get user reviews
// @access  Private (User only)
router.get('/reviews', [auth, requireUserType('user')], async (req, res) => {
  try {
    const reviews = await Review.findByUser(req.user.id);

    res.json({
      success: true,
      reviews
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reseñas'
    });
  }
});

// @route   POST /api/users/favorites/:venueId
// @desc    Add venue to favorites
// @access  Private (User only)
router.post('/favorites/:venueId', [auth, requireUserType('user')], async (req, res) => {
  try {
    const { venueId } = req.params;

    // Check if venue exists
    const venue = await Venue.findByPk(venueId);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue no encontrado'
      });
    }

    // Check if already in favorites
    const currentFavorites = req.user.favoriteVenues || [];
    if (currentFavorites.includes(venueId)) {
      return res.status(400).json({
        success: false,
        message: 'Venue ya está en favoritos'
      });
    }

    // Add to favorites
    await req.user.update({
      favoriteVenues: [...currentFavorites, venueId]
    });

    res.json({
      success: true,
      message: 'Venue agregado a favoritos',
      favoriteVenues: req.user.favoriteVenues
    });

  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar a favoritos'
    });
  }
});

// @route   DELETE /api/users/favorites/:venueId
// @desc    Remove venue from favorites
// @access  Private (User only)
router.delete('/favorites/:venueId', [auth, requireUserType('user')], async (req, res) => {
  try {
    const { venueId } = req.params;

    // Remove from favorites
    const currentFavorites = req.user.favoriteVenues || [];
    const newFavorites = currentFavorites.filter(id => id !== venueId);

    await req.user.update({
      favoriteVenues: newFavorites
    });

    res.json({
      success: true,
      message: 'Venue removido de favoritos',
      favoriteVenues: newFavorites
    });

  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al remover de favoritos'
    });
  }
});

// @route   GET /api/users/favorites
// @desc    Get user favorite venues
// @access  Private (User only)
router.get('/favorites', [auth, requireUserType('user')], async (req, res) => {
  try {
    const favoriteIds = req.user.favoriteVenues || [];
    
    if (favoriteIds.length === 0) {
      return res.json({
        success: true,
        venues: []
      });
    }

    const venues = await Venue.findAll({
      where: {
        id: { [require('sequelize').Op.in]: favoriteIds },
        isActive: true
      },
      attributes: ['id', 'name', 'address', 'neighborhood', 'city', 'mainImage', 'averageRating', 'totalReviews'],
      include: [
        {
          model: Court,
          as: 'courts',
          where: { isActive: true },
          attributes: ['id', 'name', 'courtType', 'basePrice'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      venues
    });

  } catch (error) {
    console.error('Get favorite venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener venues favoritos'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private (User only)
router.get('/stats', [auth, requireUserType('user')], async (req, res) => {
  try {
    const userId = req.user.id;

    // Get booking statistics
    const bookingStats = await Booking.findAll({
      where: { userId },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('totalPrice')), 'totalSpent']
      ],
      group: ['status'],
      raw: true
    });

    // Get total statistics
    const totalStats = await Booking.findOne({
      where: { userId },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalBookings'],
        [require('sequelize').fn('SUM', require('sequelize').col('totalPrice')), 'totalSpent'],
        [require('sequelize').fn('AVG', require('sequelize').col('totalPrice')), 'averageBookingPrice']
      ],
      raw: true
    });

    // Get most booked venues
    const topVenues = await Booking.findAll({
      where: { userId },
      include: [
        {
          model: Court,
          as: 'court',
          include: [
            {
              model: Venue,
              as: 'venue',
              attributes: ['id', 'name', 'mainImage']
            }
          ]
        }
      ],
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('bookings.id')), 'bookingCount']
      ],
      group: ['court.venue.id', 'court.venue.name', 'court.venue.mainImage'],
      order: [[require('sequelize').literal('bookingCount'), 'DESC']],
      limit: 3,
      raw: true
    });

    const stats = {
      bookingsByStatus: bookingStats.reduce((acc, stat) => {
        acc[stat.status] = {
          count: parseInt(stat.count),
          spent: parseFloat(stat.totalSpent) || 0
        };
        return acc;
      }, {}),
      totals: {
        bookings: parseInt(totalStats?.totalBookings) || 0,
        spent: parseFloat(totalStats?.totalSpent) || 0,
        averagePrice: parseFloat(totalStats?.averageBookingPrice) || 0
      },
      topVenues: topVenues.map(venue => ({
        id: venue['court.venue.id'],
        name: venue['court.venue.name'],
        image: venue['court.venue.mainImage'],
        bookings: parseInt(venue.bookingCount)
      }))
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

module.exports = router;
