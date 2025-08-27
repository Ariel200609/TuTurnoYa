const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Venue, Court, VenueOwner, Review, User, Booking } = require('../models');
const { auth, requireUserType, requireVenueOwnership, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

// @route   GET /api/venues
// @desc    Get all venues with filters and search
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Límite inválido'),
  query('city').optional().isString().withMessage('Ciudad inválida'),
  query('neighborhood').optional().isString().withMessage('Barrio inválido'),
  query('courtType').optional().isString().withMessage('Tipo de cancha inválido'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Precio mínimo inválido'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Precio máximo inválido'),
  query('amenities').optional().isString().withMessage('Comodidades inválidas'),
  query('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating inválido'),
  query('lat').optional().isFloat().withMessage('Latitud inválida'),
  query('lng').optional().isFloat().withMessage('Longitud inválida'),
  query('radius').optional().isFloat({ min: 0 }).withMessage('Radio inválido'),
  query('search').optional().isString().withMessage('Búsqueda inválida'),
  query('sortBy').optional().isIn(['name', 'rating', 'price', 'distance']).withMessage('Ordenamiento inválido'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Orden inválido')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros inválidos',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 12,
      city,
      neighborhood,
      courtType,
      minPrice,
      maxPrice,
      amenities,
      rating,
      lat,
      lng,
      radius = 10,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const offset = (page - 1) * limit;
    let where = {
      isActive: true,
      isVerified: true
    };
    let having = {};
    let order = [];

    // Location filters
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (neighborhood) where.neighborhood = { [Op.iLike]: `%${neighborhood}%` };

    // Text search
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Amenities filter
    if (amenities) {
      const amenityList = amenities.split(',');
      where.amenities = { [Op.overlap]: amenityList };
    }

    // Rating filter
    if (rating) {
      where.averageRating = { [Op.gte]: parseFloat(rating) };
    }

    // Include courts for price filtering and court type filtering
    const courtInclude = {
      model: Court,
      as: 'courts',
      where: { isActive: true },
      attributes: ['id', 'name', 'courtType', 'basePrice', 'surfaceType', 'maxPlayers', 'mainImage'],
      required: false
    };

    // Court type filter
    if (courtType) {
      courtInclude.where.courtType = courtType;
      courtInclude.required = true;
    }

    // Price filter (applied to courts)
    if (minPrice || maxPrice) {
      if (minPrice) courtInclude.where.basePrice = { [Op.gte]: parseFloat(minPrice) };
      if (maxPrice) {
        courtInclude.where.basePrice = courtInclude.where.basePrice || {};
        courtInclude.where.basePrice[Op.lte] = parseFloat(maxPrice);
      }
      courtInclude.required = true;
    }

    // Sorting
    switch (sortBy) {
      case 'name':
        order.push(['name', sortOrder.toUpperCase()]);
        break;
      case 'rating':
        order.push(['averageRating', sortOrder.toUpperCase()]);
        break;
      case 'price':
        // Sort by minimum court price
        order.push([{ model: Court, as: 'courts' }, 'basePrice', sortOrder.toUpperCase()]);
        break;
      case 'distance':
        if (lat && lng) {
          // Simple distance calculation (for more precision, use PostGIS)
          order.push([
            require('sequelize').literal(`
              SQRT(
                POW(69.1 * (latitude - ${lat}), 2) + 
                POW(69.1 * (${lng} - longitude) * COS(latitude / 57.3), 2)
              ) ${sortOrder.toUpperCase()}
            `)
          ]);
        }
        break;
      default:
        order.push(['name', 'ASC']);
    }

    // Distance filter
    if (lat && lng && radius) {
      // Simple bounding box calculation
      const latDelta = radius / 69.1; // Rough miles to latitude degrees
      const lngDelta = radius / (69.1 * Math.cos(lat * Math.PI / 180));
      
      where.latitude = { [Op.between]: [lat - latDelta, lat + latDelta] };
      where.longitude = { [Op.between]: [lng - lngDelta, lng + lngDelta] };
    }

    const venues = await Venue.findAndCountAll({
      where,
      include: [
        courtInclude,
        {
          model: VenueOwner,
          as: 'owner',
          attributes: ['id', 'businessName', 'firstName', 'lastName']
        }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    // Calculate distance if coordinates provided
    if (lat && lng) {
      venues.rows = venues.rows.map(venue => {
        const distance = venue.calculateDistance(parseFloat(lat), parseFloat(lng));
        return {
          ...venue.toJSON(),
          distance: distance ? Math.round(distance * 10) / 10 : null
        };
      });
    }

    // Add favorite status if user is authenticated
    if (req.user && req.userType === 'user') {
      const favoriteVenues = req.user.favoriteVenues || [];
      venues.rows = venues.rows.map(venue => ({
        ...venue.toJSON(),
        isFavorite: favoriteVenues.includes(venue.id)
      }));
    }

    res.json({
      success: true,
      venues: venues.rows,
      pagination: {
        total: venues.count,
        page: parseInt(page),
        pages: Math.ceil(venues.count / limit),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener venues'
    });
  }
});

// @route   GET /api/venues/:id
// @desc    Get single venue by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const venue = await Venue.findOne({
      where: {
        id: req.params.id,
        isActive: true
      },
      include: [
        {
          model: Court,
          as: 'courts',
          where: { isActive: true },
          required: false,
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        },
        {
          model: VenueOwner,
          as: 'owner',
          attributes: ['id', 'businessName', 'firstName', 'lastName', 'phoneNumber', 'email']
        },
        {
          model: Review,
          as: 'reviews',
          where: { isApproved: true, isFlagged: false },
          required: false,
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'profileImage']
            }
          ]
        }
      ]
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue no encontrado'
      });
    }

    let venueData = venue.toJSON();

    // Add favorite status if user is authenticated
    if (req.user && req.userType === 'user') {
      const favoriteVenues = req.user.favoriteVenues || [];
      venueData.isFavorite = favoriteVenues.includes(venue.id);
    }

    // Get review statistics
    const reviewStats = await Review.calculateVenueStats(venue.id);
    venueData.reviewStats = reviewStats;

    res.json({
      success: true,
      venue: venueData
    });

  } catch (error) {
    console.error('Get venue by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener venue'
    });
  }
});

// @route   POST /api/venues
// @desc    Create new venue (venue owners only)
// @access  Private (Venue Owner)
router.post('/', [
  auth,
  requireUserType('venue_owner'),
  body('name').isLength({ min: 3, max: 100 }).withMessage('Nombre del venue requerido (3-100 caracteres)'),
  body('address').notEmpty().withMessage('Dirección requerida'),
  body('city').optional().isString(),
  body('neighborhood').optional().isString(),
  body('phoneNumber').notEmpty().withMessage('Teléfono requerido'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  body('amenities').optional().isArray().withMessage('Amenities debe ser un array'),
  body('description').optional().isString()
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

    const venueData = {
      ...req.body,
      ownerId: req.user.id,
      isVerified: false, // Admin needs to verify
      isActive: true
    };

    const venue = await Venue.create(venueData);

    res.status(201).json({
      success: true,
      message: 'Venue creado exitosamente. Pendiente de verificación.',
      venue
    });

  } catch (error) {
    console.error('Create venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear venue'
    });
  }
});

// @route   PUT /api/venues/:id
// @desc    Update venue
// @access  Private (Venue Owner - own venues only)
router.put('/:id', [
  auth,
  requireVenueOwnership,
  body('name').optional().isLength({ min: 3, max: 100 }).withMessage('Nombre inválido'),
  body('address').optional().notEmpty().withMessage('Dirección no puede estar vacía'),
  body('phoneNumber').optional().notEmpty().withMessage('Teléfono no puede estar vacío'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  body('amenities').optional().isArray().withMessage('Amenities debe ser un array')
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

    await req.venue.update(req.body);

    res.json({
      success: true,
      message: 'Venue actualizado correctamente',
      venue: req.venue
    });

  } catch (error) {
    console.error('Update venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar venue'
    });
  }
});

// @route   POST /api/venues/:id/images
// @desc    Upload venue images
// @access  Private (Venue Owner - own venues only)
router.post('/:id/images', [
  auth,
  requireVenueOwnership,
  upload.array('images', 10)
], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Al menos una imagen requerida'
      });
    }

    const uploadPromises = req.files.map((file, index) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'tuturno-ya/venues',
            public_id: `venue_${req.venue.id}_${Date.now()}_${index}`,
            transformation: [
              { width: 1200, height: 800, crop: 'fill' },
              { quality: 'auto:good' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    // Update venue images
    const currentImages = req.venue.images || [];
    const newImages = [...currentImages, ...imageUrls];

    // Set first image as main image if not set
    const updateData = { images: newImages };
    if (!req.venue.mainImage && imageUrls.length > 0) {
      updateData.mainImage = imageUrls[0];
    }

    await req.venue.update(updateData);

    res.json({
      success: true,
      message: 'Imágenes subidas correctamente',
      images: newImages,
      mainImage: req.venue.mainImage || imageUrls[0]
    });

  } catch (error) {
    console.error('Upload venue images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imágenes'
    });
  }
});

// @route   DELETE /api/venues/:id/images
// @desc    Delete venue image
// @access  Private (Venue Owner - own venues only)
router.delete('/:id/images', [
  auth,
  requireVenueOwnership,
  body('imageUrl').isURL().withMessage('URL de imagen inválida')
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

    const { imageUrl } = req.body;
    const currentImages = req.venue.images || [];

    if (!currentImages.includes(imageUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    // Remove image from array
    const newImages = currentImages.filter(img => img !== imageUrl);

    // Update main image if deleted
    let updateData = { images: newImages };
    if (req.venue.mainImage === imageUrl) {
      updateData.mainImage = newImages.length > 0 ? newImages[0] : null;
    }

    await req.venue.update(updateData);

    // Delete from Cloudinary
    try {
      const publicId = imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`tuturno-ya/venues/${publicId}`);
    } catch (cloudinaryError) {
      console.warn('Failed to delete from Cloudinary:', cloudinaryError);
    }

    res.json({
      success: true,
      message: 'Imagen eliminada correctamente',
      images: newImages
    });

  } catch (error) {
    console.error('Delete venue image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar imagen'
    });
  }
});

// @route   GET /api/venues/:id/availability
// @desc    Get venue court availability for a specific date
// @access  Public
router.get('/:id/availability', [
  query('date').isISO8601().withMessage('Fecha inválida (formato ISO8601 requerido)'),
  query('duration').optional().isInt({ min: 30, max: 480 }).withMessage('Duración inválida (30-480 minutos)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros inválidos',
        errors: errors.array()
      });
    }

    const { date, duration = 60 } = req.query;
    const venueId = req.params.id;

    // Check if venue exists
    const venue = await Venue.findByPk(venueId);
    if (!venue || !venue.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Venue no encontrado'
      });
    }

    // Get all courts for this venue
    const courts = await Court.findAll({
      where: {
        venueId,
        isActive: true,
        isAvailable: true,
        maintenanceMode: false
      }
    });

    // Get existing bookings for this date
    const existingBookings = await Booking.findAll({
      where: {
        courtId: { [Op.in]: courts.map(c => c.id) },
        bookingDate: date,
        status: { [Op.in]: ['pending', 'confirmed', 'paid'] }
      },
      attributes: ['courtId', 'startTime', 'endTime']
    });

    // Calculate availability for each court
    const courtAvailability = courts.map(court => {
      const availableSlots = court.getAvailableSlots(new Date(date));
      
      // Remove slots that conflict with existing bookings
      const courtBookings = existingBookings.filter(b => b.courtId === court.id);
      const filteredSlots = availableSlots.filter(slot => {
        return !courtBookings.some(booking => {
          return !(slot.endTime <= booking.startTime || slot.startTime >= booking.endTime);
        });
      });

      return {
        court: {
          id: court.id,
          name: court.name,
          courtType: court.courtType,
          surfaceType: court.surfaceType,
          maxPlayers: court.maxPlayers,
          basePrice: court.basePrice,
          mainImage: court.mainImage
        },
        availableSlots: filteredSlots,
        totalSlots: filteredSlots.length
      };
    });

    res.json({
      success: true,
      venue: {
        id: venue.id,
        name: venue.name
      },
      date,
      courts: courtAvailability
    });

  } catch (error) {
    console.error('Get venue availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener disponibilidad'
    });
  }
});

// @route   GET /api/venues/:id/reviews
// @desc    Get venue reviews
// @access  Public
router.get('/:id/reviews', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Límite inválido'),
  query('sortBy').optional().isIn(['date', 'rating']).withMessage('Ordenamiento inválido'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Orden inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros inválidos',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = req.query;
    const venueId = req.params.id;

    const reviews = await Review.findByVenue(venueId, {
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      sortBy,
      sortOrder,
      includeUser: true
    });

    const reviewStats = await Review.calculateVenueStats(venueId);

    res.json({
      success: true,
      reviews: reviews.rows,
      pagination: {
        total: reviews.count,
        page: parseInt(page),
        pages: Math.ceil(reviews.count / limit),
        limit: parseInt(limit)
      },
      stats: reviewStats
    });

  } catch (error) {
    console.error('Get venue reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reseñas'
    });
  }
});

module.exports = router;
