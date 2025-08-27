const express = require('express');
const { query, validationResult } = require('express-validator');
const { Notification } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', [auth], async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    
    // Set target based on user type
    if (req.userType === 'user') {
      where.userId = req.user.id;
    } else if (req.userType === 'venue_owner') {
      where.venueOwnerId = req.user.id;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Tipo de usuario no soportado para notificaciones'
      });
    }

    // Filter unread only if requested
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get unread count
    const unreadCount = await Notification.count({
      where: {
        ...where,
        isRead: false
      }
    });

    res.json({
      success: true,
      notifications: notifications.rows,
      pagination: {
        total: notifications.count,
        page: parseInt(page),
        pages: Math.ceil(notifications.count / limit),
        limit: parseInt(limit)
      },
      unreadCount
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones'
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', [auth], async (req, res) => {
  try {
    let where = { id: req.params.id };
    
    if (req.userType === 'user') {
      where.userId = req.user.id;
    } else if (req.userType === 'venue_owner') {
      where.venueOwnerId = req.user.id;
    }

    const notification = await Notification.findOne({ where });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notificación marcada como leída'
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificación como leída'
    });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', [auth], async (req, res) => {
  try {
    await Notification.markAllAsRead(req.userType, req.user.id);

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas'
    });

  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar todas las notificaciones como leídas'
    });
  }
});

module.exports = router;
