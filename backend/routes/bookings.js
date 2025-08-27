const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Booking, Court, Venue, User, VenueOwner, Notification } = require('../models');
const { auth, requireUserType, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private (User only)
router.post('/', [
  auth,
  requireUserType('user'),
  body('courtId').isUUID().withMessage('Court ID inválido'),
  body('bookingDate').isISO8601().withMessage('Fecha de reserva inválida'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de inicio inválida'),
  body('duration').isInt({ min: 30, max: 480 }).withMessage('Duración inválida (30-480 minutos)'),
  body('playerCount').isInt({ min: 1, max: 22 }).withMessage('Cantidad de jugadores inválida'),
  body('contactName').isLength({ min: 2, max: 100 }).withMessage('Nombre de contacto requerido'),
  body('contactPhone').isMobilePhone('any').withMessage('Teléfono de contacto inválido'),
  body('contactEmail').optional().isEmail().withMessage('Email de contacto inválido'),
  body('players').optional().isArray().withMessage('Lista de jugadores debe ser un array'),
  body('specialRequests').optional().isString().withMessage('Solicitudes especiales inválidas')
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

    const {
      courtId,
      bookingDate,
      startTime,
      duration,
      playerCount,
      contactName,
      contactPhone,
      contactEmail,
      players = [],
      specialRequests,
      equipmentRequested = []
    } = req.body;

    // Verify court exists and is available
    const court = await Court.findOne({
      where: {
        id: courtId,
        isActive: true,
        isAvailable: true,
        maintenanceMode: false
      },
      include: [
        {
          model: Venue,
          as: 'venue',
          where: { isActive: true, isVerified: true },
          include: [
            {
              model: VenueOwner,
              as: 'owner',
              attributes: ['id', 'commissionRate']
            }
          ]
        }
      ]
    });

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Cancha no encontrada o no disponible'
      });
    }

    // Calculate end time
    const startDateTime = new Date(`${bookingDate} ${startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
    const endTime = endDateTime.toTimeString().slice(0, 5);

    // Check if booking is in the future
    if (startDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'No se pueden hacer reservas para fechas pasadas'
      });
    }

    // Check if court is available at this time
    if (!court.isAvailableAt(new Date(bookingDate), startTime, endTime)) {
      return res.status(400).json({
        success: false,
        message: 'La cancha no está disponible en este horario'
      });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.findConflicting(
      courtId, 
      bookingDate, 
      startTime, 
      endTime
    );

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una reserva para este horario'
      });
    }

    // Calculate pricing
    const basePrice = court.calculatePrice(bookingDate, startTime, duration);
    const commissionRate = court.venue.owner.commissionRate || 0.1;
    const commissionAmount = basePrice * commissionRate;
    const venueAmount = basePrice - commissionAmount;

    // Generate booking number
    const bookingNumber = await Booking.generateBookingNumber();

    // Create booking
    const booking = await Booking.create({
      bookingNumber,
      userId: req.user.id,
      courtId,
      bookingDate,
      startTime,
      endTime,
      duration,
      playerCount,
      contactName,
      contactPhone,
      contactEmail,
      players,
      specialRequests,
      equipmentRequested,
      basePrice: court.basePrice,
      priceMultiplier: basePrice / (court.basePrice * (duration / 60)),
      totalPrice: basePrice,
      commissionRate,
      commissionAmount,
      venueAmount,
      status: court.venue.autoConfirm ? 'confirmed' : 'pending'
    });

    // Load booking with related data
    const fullBooking = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Court,
          as: 'court',
          include: [
            {
              model: Venue,
              as: 'venue',
              attributes: ['id', 'name', 'address', 'phoneNumber']
            }
          ]
        }
      ]
    });

    // Create notifications
    if (booking.status === 'confirmed') {
      // Notify user of confirmation
      await Notification.createBookingConfirmation(fullBooking, req.user);
      
      // Create reminder notification (scheduled for 24h before)
      await Notification.createBookingReminder(fullBooking, req.user);
    } else {
      // Notify venue owner of pending booking
      await Notification.create({
        title: 'Nueva reserva pendiente ⚽',
        message: `Tienes una nueva reserva para el ${bookingDate} a las ${startTime}. Revisa y confirma.`,
        type: 'booking_pending',
        priority: 'high',
        channels: ['app', 'email'],
        targetType: 'venue_owner',
        venueOwnerId: court.venue.ownerId,
        bookingId: booking.id,
        data: {
          bookingNumber: booking.bookingNumber,
          courtName: court.name,
          venueName: court.venue.name
        }
      });
    }

    res.status(201).json({
      success: true,
      message: booking.status === 'confirmed' ? 
        'Reserva confirmada exitosamente' : 
        'Reserva creada. Pendiente de confirmación.',
      booking: fullBooking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear reserva'
    });
  }
});

// @route   GET /api/bookings
// @desc    Get user's bookings or venue owner's bookings
// @access  Private
router.get('/', [auth], async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      courtId,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    let where = {};
    let include = [];

    // Set where conditions based on user type
    if (req.userType === 'user') {
      where.userId = req.user.id;
      include = [
        {
          model: Court,
          as: 'court',
          include: [
            {
              model: Venue,
              as: 'venue',
              attributes: ['id', 'name', 'address', 'phoneNumber']
            }
          ]
        }
      ];
    } else if (req.userType === 'venue_owner') {
      // Get bookings for venue owner's venues
      include = [
        {
          model: Court,
          as: 'court',
          include: [
            {
              model: Venue,
              as: 'venue',
              where: { ownerId: req.user.id },
              attributes: ['id', 'name', 'address']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'phoneNumber']
        }
      ];
    } else {
      return res.status(403).json({
        success: false,
        message: 'Acceso no autorizado'
      });
    }

    // Apply filters
    if (status) where.status = status;
    if (startDate) where.bookingDate = { ...where.bookingDate, [Op.gte]: startDate };
    if (endDate) where.bookingDate = { ...where.bookingDate, [Op.lte]: endDate };
    if (courtId) where.courtId = courtId;

    const bookings = await Booking.findAndCountAll({
      where,
      include,
      order: [['bookingDate', 'DESC'], ['startTime', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get summary statistics
    const summary = await Booking.findAll({
      where: req.userType === 'user' ? { userId: req.user.id } : {},
      include: req.userType === 'venue_owner' ? [
        {
          model: Court,
          as: 'court',
          include: [
            {
              model: Venue,
              as: 'venue',
              where: { ownerId: req.user.id }
            }
          ]
        }
      ] : [],
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('bookings.id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('totalPrice')), 'totalRevenue']
      ],
      group: ['status'],
      raw: true
    });

    const summaryData = summary.reduce((acc, item) => {
      acc[item.status] = {
        count: parseInt(item.count),
        revenue: parseFloat(item.totalRevenue) || 0
      };
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
      summary: summaryData
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reservas'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get specific booking
// @access  Private
router.get('/:id', [auth], async (req, res) => {
  try {
    let where = { id: req.params.id };
    let include = [];

    if (req.userType === 'user') {
      where.userId = req.user.id;
      include = [
        {
          model: Court,
          as: 'court',
          include: [
            {
              model: Venue,
              as: 'venue',
              attributes: ['id', 'name', 'address', 'phoneNumber', 'email', 'operatingHours', 'amenities']
            }
          ]
        }
      ];
    } else if (req.userType === 'venue_owner') {
      include = [
        {
          model: Court,
          as: 'court',
          include: [
            {
              model: Venue,
              as: 'venue',
              where: { ownerId: req.user.id }
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'email']
        }
      ];
    } else if (req.userType === 'admin') {
      include = [
        {
          model: Court,
          as: 'court',
          include: [
            {
              model: Venue,
              as: 'venue'
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'email']
        }
      ];
    }

    const booking = await Booking.findOne({
      where,
      include
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
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reserva'
    });
  }
});

// @route   PUT /api/bookings/:id/confirm
// @desc    Confirm booking (venue owner only)
// @access  Private (Venue Owner)
router.put('/:id/confirm', [
  auth,
  requireUserType('venue_owner')
], async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, status: 'pending' },
      include: [
        {
          model: Court,
          as: 'court',
          include: [
            {
              model: Venue,
              as: 'venue',
              where: { ownerId: req.user.id }
            }
          ]
        },
        {
          model: User,
          as: 'user'
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada o no tienes permisos'
      });
    }

    // Update booking status
    await booking.update({
      status: 'confirmed',
      confirmedAt: new Date()
    });

    // Notify user
    await Notification.createBookingConfirmation(booking, booking.user);
    
    // Create reminder notification
    await Notification.createBookingReminder(booking, booking.user);

    res.json({
      success: true,
      message: 'Reserva confirmada exitosamente',
      booking
    });

  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar reserva'
    });
  }
});

// @route   PUT /api/bookings/:id/reject
// @desc    Reject booking (venue owner only)
// @access  Private (Venue Owner)
router.put('/:id/reject', [
  auth,
  requireUserType('venue_owner'),
  body('reason').optional().isString().withMessage('Razón inválida')
], async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findOne({
      where: { id: req.params.id, status: 'pending' },
      include: [
        {
          model: Court,
          as: 'court',
          include: [
            {
              model: Venue,
              as: 'venue',
              where: { ownerId: req.user.id }
            }
          ]
        },
        {
          model: User,
          as: 'user'
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada o no tienes permisos'
      });
    }

    // Update booking status
    await booking.update({
      status: 'rejected',
      cancellationReason: reason,
      cancelledBy: 'venue',
      cancelledAt: new Date()
    });

    // Notify user
    await Notification.create({
      title: 'Reserva rechazada 😔',
      message: `Tu reserva para el ${booking.bookingDate} ha sido rechazada. ${reason ? `Motivo: ${reason}` : ''}`,
      type: 'booking_cancelled',
      priority: 'high',
      channels: ['app', 'sms'],
      targetType: 'user',
      userId: booking.userId,
      bookingId: booking.id,
      data: {
        bookingNumber: booking.bookingNumber,
        reason
      }
    });

    res.json({
      success: true,
      message: 'Reserva rechazada',
      booking
    });

  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rechazar reserva'
    });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', [
  auth,
  body('reason').optional().isString().withMessage('Razón inválida')
], async (req, res) => {
  try {
    const { reason } = req.body;
    
    let where = { id: req.params.id };
    let include = [];

    if (req.userType === 'user') {
      where.userId = req.user.id;
      include = [
        {
          model: Court,
          as: 'court',
          include: [
            {
              model: Venue,
              as: 'venue'
            }
          ]
        }
      ];
    } else if (req.userType === 'venue_owner') {
      include = [
        {
          model: Court,
          as: 'court',
          include: [
            {
              model: Venue,
              as: 'venue',
              where: { ownerId: req.user.id }
            }
          ]
        },
        {
          model: User,
          as: 'user'
        }
      ];
    } else if (req.userType === 'admin') {
      include = [
        {
          model: Court,
          as: 'court',
          include: [
            {
              model: Venue,
              as: 'venue'
            }
          ]
        },
        {
          model: User,
          as: 'user'
        }
      ];
    }

    const booking = await Booking.findOne({
      where: {
        ...where,
        status: { [Op.in]: ['pending', 'confirmed', 'paid'] }
      },
      include
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada o no se puede cancelar'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Esta reserva no se puede cancelar (debe ser con más de 24 horas de anticipación)'
      });
    }

    // Calculate refund
    const refundAmount = booking.calculateRefundAmount();

    // Update booking
    await booking.update({
      status: 'cancelled',
      cancellationReason: reason,
      cancelledBy: req.userType,
      cancelledAt: new Date(),
      refundAmount
    });

    // Notify relevant parties
    if (req.userType === 'user') {
      // Notify venue owner
      await Notification.create({
        title: 'Reserva cancelada por cliente',
        message: `La reserva ${booking.bookingNumber} ha sido cancelada por el cliente.`,
        type: 'booking_cancelled',
        priority: 'medium',
        channels: ['app', 'email'],
        targetType: 'venue_owner',
        venueOwnerId: booking.court.venue.ownerId,
        bookingId: booking.id
      });
    } else if (req.userType === 'venue_owner') {
      // Notify user
      await Notification.create({
        title: 'Reserva cancelada por el venue',
        message: `Tu reserva para el ${booking.bookingDate} ha sido cancelada. ${reason ? `Motivo: ${reason}` : ''}`,
        type: 'booking_cancelled',
        priority: 'high',
        channels: ['app', 'sms'],
        targetType: 'user',
        userId: booking.userId,
        bookingId: booking.id,
        data: { reason, refundAmount }
      });
    }

    res.json({
      success: true,
      message: 'Reserva cancelada exitosamente',
      booking,
      refundAmount
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar reserva'
    });
  }
});

// @route   POST /api/bookings/:id/checkin
// @desc    Check in to booking (venue owner)
// @access  Private (Venue Owner)
router.post('/:id/checkin', [
  auth,
  requireUserType('venue_owner')
], async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { 
        id: req.params.id, 
        status: { [Op.in]: ['confirmed', 'paid'] }
      },
      include: [
        {
          model: Court,
          as: 'court',
          include: [
            {
              model: Venue,
              as: 'venue',
              where: { ownerId: req.user.id }
            }
          ]
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada o no tienes permisos'
      });
    }

    // Check if booking is for today
    const today = new Date().toISOString().split('T')[0];
    const bookingDate = booking.bookingDate.toISOString().split('T')[0];
    
    if (bookingDate !== today) {
      return res.status(400).json({
        success: false,
        message: 'Solo se puede hacer check-in el día de la reserva'
      });
    }

    // Update booking
    await booking.update({
      checkInAt: new Date(),
      status: 'confirmed' // Ensure status is confirmed after check-in
    });

    res.json({
      success: true,
      message: 'Check-in realizado exitosamente',
      booking
    });

  } catch (error) {
    console.error('Check-in booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al realizar check-in'
    });
  }
});

// @route   PUT /api/bookings/:id/complete
// @desc    Mark booking as completed (venue owner)
// @access  Private (Venue Owner)
router.put('/:id/complete', [
  auth,
  requireUserType('venue_owner')
], async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { 
        id: req.params.id, 
        status: { [Op.in]: ['confirmed', 'paid'] }
      },
      include: [
        {
          model: Court,
          as: 'court',
          include: [
            {
              model: Venue,
              as: 'venue',
              where: { ownerId: req.user.id }
            }
          ]
        },
        {
          model: User,
          as: 'user'
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada o no tienes permisos'
      });
    }

    // Check if booking time has passed
    const bookingEndTime = new Date(`${booking.bookingDate} ${booking.endTime}`);
    if (bookingEndTime > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'No se puede completar una reserva antes de que termine'
      });
    }

    // Update booking
    await booking.update({
      status: 'completed'
    });

    // Update statistics
    await Promise.all([
      // Update user stats
      req.user.increment('totalBookings'),
      // Update venue stats
      booking.court.venue.increment(['totalBookings', 'totalRevenue'], {
        totalRevenue: booking.venueAmount
      }),
      // Update court stats
      booking.court.increment(['totalBookings', 'totalRevenue'], {
        totalRevenue: booking.totalPrice
      })
    ]);

    // Notify user to leave a review
    await Notification.create({
      title: '¡Partido terminado! ⚽ ¿Cómo estuvo?',
      message: `Tu reserva en ${booking.court.venue.name} ha terminado. ¿Nos cuentas cómo estuvo?`,
      type: 'review_request',
      priority: 'medium',
      channels: ['app'],
      targetType: 'user',
      userId: booking.userId,
      bookingId: booking.id,
      data: {
        venueName: booking.court.venue.name,
        courtName: booking.court.name
      },
      actionButtons: [
        {
          text: 'Dejar Reseña',
          action: 'write_review',
          data: { bookingId: booking.id, venueId: booking.court.venue.id }
        }
      ]
    });

    res.json({
      success: true,
      message: 'Reserva marcada como completada',
      booking
    });

  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al completar reserva'
    });
  }
});

module.exports = router;
