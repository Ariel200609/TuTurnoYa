const express = require('express');
const { query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { User, VenueOwner, Admin, Venue, Court, Booking, Review, Notification } = require('../models');
const { auth, requireUserType, requirePermission } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(auth);
router.use(requireUserType('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', requirePermission('view_dashboard'), async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get overall statistics
    const [
      totalUsers,
      totalVenueOwners,
      totalVenues,
      totalCourts,
      totalBookings,
      activeBookings,
      totalRevenue
    ] = await Promise.all([
      User.count({ where: { isActive: true } }),
      VenueOwner.count({ where: { isActive: true } }),
      Venue.count({ where: { isActive: true, isVerified: true } }),
      Court.count({ where: { isActive: true } }),
      Booking.count(),
      Booking.count({ where: { status: { [Op.in]: ['pending', 'confirmed', 'paid'] } } }),
      Booking.sum('commissionAmount', { where: { status: 'completed' } })
    ]);

    // Get recent activity (last 30 days)
    const [
      newUsers,
      newVenues,
      newBookings,
      recentRevenue
    ] = await Promise.all([
      User.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      Venue.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      Booking.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      Booking.sum('commissionAmount', { 
        where: { 
          status: 'completed',
          createdAt: { [Op.gte]: thirtyDaysAgo }
        } 
      })
    ]);

    // Get booking statistics by status
    const bookingStats = await Booking.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Get top venues by bookings
    const topVenues = await Venue.findAll({
      attributes: [
        'id', 'name', 'totalBookings', 'totalRevenue', 'averageRating'
      ],
      where: { isActive: true, isVerified: true },
      order: [['totalBookings', 'DESC']],
      limit: 5
    });

    // Get pending verifications
    const pendingVenues = await Venue.count({
      where: { isActive: true, isVerified: false }
    });

    const pendingReviews = await Review.count({
      where: { isFlagged: true }
    });

    const stats = {
      overview: {
        totalUsers,
        totalVenueOwners,
        totalVenues,
        totalCourts,
        totalBookings,
        activeBookings,
        totalRevenue: parseFloat(totalRevenue) || 0,
        pendingVenues,
        pendingReviews
      },
      growth: {
        newUsers,
        newVenues,
        newBookings,
        recentRevenue: parseFloat(recentRevenue) || 0
      },
      bookingStats: bookingStats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.count);
        return acc;
      }, {}),
      topVenues
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del dashboard'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users for admin management
// @access  Private (Admin)
router.get('/users', requirePermission('manage_users'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { phoneNumber: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (status) {
      where.isActive = status === 'active';
    }

    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ['verificationCode', 'verificationCodeExpiry'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      users: users.rows,
      pagination: {
        total: users.count,
        page: parseInt(page),
        pages: Math.ceil(users.count / limit),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
});

// @route   GET /api/admin/venues
// @desc    Get all venues for admin management
// @access  Private (Admin)
router.get('/venues', requirePermission('manage_venues'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, verified } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (status) {
      where.isActive = status === 'active';
    }
    if (verified !== undefined) {
      where.isVerified = verified === 'true';
    }

    const venues = await Venue.findAndCountAll({
      where,
      include: [
        {
          model: VenueOwner,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'businessName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

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
    console.error('Get admin venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener venues'
    });
  }
});

// @route   PUT /api/admin/venues/:id/verify
// @desc    Verify venue
// @access  Private (Admin)
router.put('/venues/:id/verify', requirePermission('manage_venues'), async (req, res) => {
  try {
    const venue = await Venue.findByPk(req.params.id);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue no encontrado'
      });
    }

    await venue.update({ isVerified: true });

    // Notify venue owner
    await Notification.create({
      title: '¡Venue verificado! ✅',
      message: `Tu venue "${venue.name}" ha sido verificado y ya está visible para los usuarios.`,
      type: 'venue_approved',
      priority: 'high',
      channels: ['app', 'email'],
      targetType: 'venue_owner',
      venueOwnerId: venue.ownerId
    });

    res.json({
      success: true,
      message: 'Venue verificado exitosamente'
    });

  } catch (error) {
    console.error('Verify venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar venue'
    });
  }
});

module.exports = router;
