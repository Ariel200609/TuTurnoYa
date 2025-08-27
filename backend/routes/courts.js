const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Court, Venue, Booking } = require('../models');
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

// @route   GET /api/courts/venue/:venueId
// @desc    Get all courts for a specific venue
// @access  Public
router.get('/venue/:venueId', async (req, res) => {
  try {
    const { venueId } = req.params;
    
    // Verify venue exists and is active
    const venue = await Venue.findByPk(venueId);
    if (!venue || !venue.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Venue no encontrado'
      });
    }

    const courts = await Court.findAll({
      where: {
        venueId,
        isActive: true
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      courts
    });

  } catch (error) {
    console.error('Get venue courts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener canchas'
    });
  }
});

// @route   GET /api/courts/:id
// @desc    Get single court by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const court = await Court.findOne({
      where: {
        id: req.params.id,
        isActive: true
      },
      include: [
        {
          model: Venue,
          as: 'venue',
          attributes: ['id', 'name', 'address', 'city', 'phoneNumber', 'amenities', 'operatingHours']
        }
      ]
    });

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Cancha no encontrada'
      });
    }

    res.json({
      success: true,
      court
    });

  } catch (error) {
    console.error('Get court by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cancha'
    });
  }
});

// @route   POST /api/courts
// @desc    Create new court for venue owner's venue
// @access  Private (Venue Owner)
router.post('/', [
  auth,
  requireUserType('venue_owner'),
  body('venueId').isUUID().withMessage('Venue ID inválido'),
  body('name').isLength({ min: 2, max: 100 }).withMessage('Nombre de cancha requerido'),
  body('courtType').isIn(['Fútbol 11', 'Fútbol 8', 'Fútbol 7', 'Fútbol 5', 'Futsal', 'Tenis', 'Padel', 'Básquet', 'Vóley']).withMessage('Tipo de cancha inválido'),
  body('surfaceType').isIn(['Césped Natural', 'Césped Sintético', 'Cemento', 'Parquet', 'Tierra Batida', 'Polvo de Ladrillo']).withMessage('Tipo de superficie inválido'),
  body('basePrice').isFloat({ min: 0 }).withMessage('Precio base inválido'),
  body('maxPlayers').isInt({ min: 2, max: 22 }).withMessage('Máximo de jugadores inválido'),
  body('minBookingDuration').optional().isInt({ min: 30, max: 180 }).withMessage('Duración mínima de reserva inválida'),
  body('maxBookingDuration').optional().isInt({ min: 60, max: 480 }).withMessage('Duración máxima de reserva inválida')
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

    const { venueId } = req.body;

    // Verify venue ownership
    const venue = await Venue.findOne({
      where: {
        id: venueId,
        ownerId: req.user.id,
        isActive: true
      }
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue no encontrado o no tienes permisos'
      });
    }

    const court = await Court.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Cancha creada exitosamente',
      court
    });

  } catch (error) {
    console.error('Create court error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cancha'
    });
  }
});

// @route   PUT /api/courts/:id
// @desc    Update court (venue owner only)
// @access  Private (Venue Owner)
router.put('/:id', [
  auth,
  requireUserType('venue_owner'),
  body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Nombre inválido'),
  body('courtType').optional().isIn(['Fútbol 11', 'Fútbol 8', 'Fútbol 7', 'Fútbol 5', 'Futsal', 'Tenis', 'Padel', 'Básquet', 'Vóley']).withMessage('Tipo de cancha inválido'),
  body('surfaceType').optional().isIn(['Césped Natural', 'Césped Sintético', 'Cemento', 'Parquet', 'Tierra Batida', 'Polvo de Ladrillo']).withMessage('Tipo de superficie inválido'),
  body('basePrice').optional().isFloat({ min: 0 }).withMessage('Precio base inválido'),
  body('maxPlayers').optional().isInt({ min: 2, max: 22 }).withMessage('Máximo de jugadores inválido')
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

    // Find court and verify ownership
    const court = await Court.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Venue,
          as: 'venue',
          where: { ownerId: req.user.id }
        }
      ]
    });

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Cancha no encontrada o no tienes permisos'
      });
    }

    await court.update(req.body);

    res.json({
      success: true,
      message: 'Cancha actualizada correctamente',
      court
    });

  } catch (error) {
    console.error('Update court error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cancha'
    });
  }
});

// @route   DELETE /api/courts/:id
// @desc    Delete court (soft delete - set isActive to false)
// @access  Private (Venue Owner)
router.delete('/:id', [auth, requireUserType('venue_owner')], async (req, res) => {
  try {
    // Find court and verify ownership
    const court = await Court.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Venue,
          as: 'venue',
          where: { ownerId: req.user.id }
        }
      ]
    });

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Cancha no encontrada o no tienes permisos'
      });
    }

    // Check for future bookings
    const futureBookings = await Booking.findAll({
      where: {
        courtId: court.id,
        bookingDate: { [Op.gte]: new Date() },
        status: { [Op.in]: ['pending', 'confirmed', 'paid'] }
      }
    });

    if (futureBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar una cancha con reservas futuras'
      });
    }

    // Soft delete
    await court.update({ isActive: false });

    res.json({
      success: true,
      message: 'Cancha eliminada correctamente'
    });

  } catch (error) {
    console.error('Delete court error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cancha'
    });
  }
});

// @route   GET /api/courts/:id/availability
// @desc    Get court availability for specific dates
// @access  Public
router.get('/:id/availability', [
  query('startDate').isISO8601().withMessage('Fecha de inicio inválida'),
  query('endDate').optional().isISO8601().withMessage('Fecha de fin inválida'),
  query('duration').optional().isInt({ min: 30, max: 480 }).withMessage('Duración inválida')
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

    const { startDate, endDate = startDate, duration = 60 } = req.query;
    const courtId = req.params.id;

    // Verify court exists
    const court = await Court.findOne({
      where: {
        id: courtId,
        isActive: true,
        isAvailable: true,
        maintenanceMode: false
      }
    });

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Cancha no encontrada o no disponible'
      });
    }

    // Generate date range
    const dates = [];
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);

    while (currentDate <= endDateObj) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get existing bookings for these dates
    const existingBookings = await Booking.findAll({
      where: {
        courtId,
        bookingDate: { [Op.between]: [startDate, endDate] },
        status: { [Op.in]: ['pending', 'confirmed', 'paid'] }
      },
      attributes: ['bookingDate', 'startTime', 'endTime']
    });

    // Calculate availability for each date
    const availability = dates.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const availableSlots = court.getAvailableSlots(date);
      
      // Remove slots that conflict with existing bookings
      const dayBookings = existingBookings.filter(b => 
        b.bookingDate.toISOString().split('T')[0] === dateStr
      );
      
      const filteredSlots = availableSlots.filter(slot => {
        return !dayBookings.some(booking => {
          return !(slot.endTime <= booking.startTime || slot.startTime >= booking.endTime);
        });
      });

      return {
        date: dateStr,
        dayOfWeek: date.toLocaleDateString('es-AR', { weekday: 'long' }),
        availableSlots: filteredSlots,
        totalSlots: filteredSlots.length,
        isAvailable: filteredSlots.length > 0
      };
    });

    res.json({
      success: true,
      court: {
        id: court.id,
        name: court.name,
        courtType: court.courtType,
        basePrice: court.basePrice
      },
      availability
    });

  } catch (error) {
    console.error('Get court availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener disponibilidad'
    });
  }
});

// @route   POST /api/courts/:id/pricing
// @desc    Calculate pricing for specific date/time
// @access  Public
router.post('/:id/pricing', [
  body('date').isISO8601().withMessage('Fecha inválida'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de inicio inválida (formato HH:MM)'),
  body('duration').isInt({ min: 30, max: 480 }).withMessage('Duración inválida (30-480 minutos)')
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

    const { date, startTime, duration } = req.body;
    const courtId = req.params.id;

    const court = await Court.findByPk(courtId);
    if (!court || !court.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Cancha no encontrada'
      });
    }

    // Calculate price
    const price = court.calculatePrice(date, startTime, duration);
    
    // Get price breakdown
    const bookingDate = new Date(date);
    const isWeekend = bookingDate.getDay() === 0 || bookingDate.getDay() === 6;
    const hour = parseInt(startTime.split(':')[0]);
    
    let timeSlot = 'afternoon';
    if (hour < 12) timeSlot = 'morning';
    else if (hour >= 18) timeSlot = 'night';
    
    const ruleKey = isWeekend ? 'weekend' : 'weekday';
    const multiplier = court.priceRules[ruleKey][timeSlot].multiplier;
    const timeSlotLabel = court.priceRules[ruleKey][timeSlot].label;

    const pricing = {
      basePrice: parseFloat(court.basePrice),
      multiplier,
      timeSlot: timeSlotLabel,
      duration,
      isWeekend,
      totalPrice: price,
      breakdown: {
        basePrice: `$${court.basePrice}`,
        timeMultiplier: `x${multiplier} (${timeSlotLabel})`,
        duration: `${duration} minutos`,
        calculation: `$${court.basePrice} x ${multiplier} x ${duration/60} horas = $${price}`
      }
    };

    res.json({
      success: true,
      court: {
        id: court.id,
        name: court.name
      },
      pricing
    });

  } catch (error) {
    console.error('Calculate pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular precio'
    });
  }
});

// @route   POST /api/courts/:id/images
// @desc    Upload court images
// @access  Private (Venue Owner)
router.post('/:id/images', [
  auth,
  requireUserType('venue_owner'),
  upload.array('images', 10)
], async (req, res) => {
  try {
    // Find court and verify ownership
    const court = await Court.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Venue,
          as: 'venue',
          where: { ownerId: req.user.id }
        }
      ]
    });

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Cancha no encontrada o no tienes permisos'
      });
    }

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
            folder: 'tuturno-ya/courts',
            public_id: `court_${court.id}_${Date.now()}_${index}`,
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

    // Update court images
    const currentImages = court.images || [];
    const newImages = [...currentImages, ...imageUrls];

    // Set first image as main image if not set
    const updateData = { images: newImages };
    if (!court.mainImage && imageUrls.length > 0) {
      updateData.mainImage = imageUrls[0];
    }

    await court.update(updateData);

    res.json({
      success: true,
      message: 'Imágenes subidas correctamente',
      images: newImages,
      mainImage: court.mainImage || imageUrls[0]
    });

  } catch (error) {
    console.error('Upload court images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imágenes'
    });
  }
});

// @route   PUT /api/courts/:id/maintenance
// @desc    Toggle court maintenance mode
// @access  Private (Venue Owner)
router.put('/:id/maintenance', [
  auth,
  requireUserType('venue_owner'),
  body('maintenanceMode').isBoolean().withMessage('Modo de mantenimiento debe ser booleano'),
  body('reason').optional().isString().withMessage('Razón inválida')
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

    // Find court and verify ownership
    const court = await Court.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Venue,
          as: 'venue',
          where: { ownerId: req.user.id }
        }
      ]
    });

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Cancha no encontrada o no tienes permisos'
      });
    }

    const { maintenanceMode, reason } = req.body;

    await court.update({
      maintenanceMode,
      lastMaintenanceAt: maintenanceMode ? new Date() : court.lastMaintenanceAt
    });

    res.json({
      success: true,
      message: maintenanceMode ? 'Cancha puesta en mantenimiento' : 'Cancha disponible nuevamente',
      court: {
        id: court.id,
        name: court.name,
        maintenanceMode: court.maintenanceMode,
        lastMaintenanceAt: court.lastMaintenanceAt
      }
    });

  } catch (error) {
    console.error('Toggle maintenance mode error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar modo de mantenimiento'
    });
  }
});

module.exports = router;
