module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200]
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.ENUM(
        'booking_confirmed',
        'booking_cancelled',
        'booking_reminder',
        'payment_confirmed',
        'payment_failed',
        'venue_approved',
        'venue_rejected',
        'review_received',
        'promotion',
        'system_update',
        'weather_alert'
      ),
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    // Delivery channels
    channels: {
      type: DataTypes.ARRAY(DataTypes.ENUM('app', 'sms', 'email', 'whatsapp')),
      defaultValue: ['app']
    },
    // Target audience
    targetType: {
      type: DataTypes.ENUM('user', 'venue_owner', 'admin', 'broadcast'),
      allowNull: false
    },
    // Data payload for dynamic content
    data: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    // Status tracking
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'delivered', 'read', 'failed'),
      defaultValue: 'pending'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Delivery tracking
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    failedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Scheduling
    scheduledFor: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Action buttons/links
    actionButtons: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
      defaultValue: []
      // Format: [{ text: 'Ver Reserva', action: 'view_booking', data: { bookingId: 'xxx' } }]
    },
    deepLink: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // References (nullable to allow broadcast notifications)
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    venueOwnerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'venue_owners',
        key: 'id'
      }
    },
    bookingId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'bookings',
        key: 'id'
      }
    }
  }, {
    tableName: 'notifications',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['venueOwnerId']
      },
      {
        fields: ['bookingId']
      },
      {
        fields: ['type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['isRead']
      },
      {
        fields: ['scheduledFor']
      },
      {
        fields: ['targetType', 'priority']
      }
    ]
  });

  // Instance methods
  Notification.prototype.markAsRead = async function() {
    this.isRead = true;
    this.readAt = new Date();
    this.status = 'read';
    return this.save();
  };

  Notification.prototype.markAsDelivered = async function() {
    this.deliveredAt = new Date();
    this.status = 'delivered';
    return this.save();
  };

  Notification.prototype.markAsFailed = async function(reason) {
    this.failedAt = new Date();
    this.failureReason = reason;
    this.status = 'failed';
    return this.save();
  };

  Notification.prototype.isExpired = function() {
    return this.expiresAt && this.expiresAt < new Date();
  };

  Notification.prototype.shouldBeSent = function() {
    if (this.status !== 'pending') return false;
    if (this.isExpired()) return false;
    if (this.scheduledFor && this.scheduledFor > new Date()) return false;
    return true;
  };

  // Class methods
  Notification.findForUser = function(userId, options = {}) {
    const where = { userId };
    const order = options.order || [['createdAt', 'DESC']];
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    
    return this.findAndCountAll({
      where,
      order,
      limit,
      offset
    });
  };

  Notification.findForVenueOwner = function(venueOwnerId, options = {}) {
    const where = { venueOwnerId };
    const order = options.order || [['createdAt', 'DESC']];
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    
    return this.findAndCountAll({
      where,
      order,
      limit,
      offset
    });
  };

  Notification.findUnread = function(targetType, targetId) {
    const where = { isRead: false, status: 'delivered' };
    
    if (targetType === 'user') {
      where.userId = targetId;
    } else if (targetType === 'venue_owner') {
      where.venueOwnerId = targetId;
    }
    
    return this.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
  };

  Notification.findPendingToSend = function() {
    return this.findAll({
      where: {
        status: 'pending',
        [sequelize.Sequelize.Op.or]: [
          { scheduledFor: null },
          { scheduledFor: { [sequelize.Sequelize.Op.lte]: new Date() } }
        ],
        [sequelize.Sequelize.Op.or]: [
          { expiresAt: null },
          { expiresAt: { [sequelize.Sequelize.Op.gt]: new Date() } }
        ]
      },
      order: [['priority', 'DESC'], ['createdAt', 'ASC']]
    });
  };

  Notification.markAllAsRead = async function(targetType, targetId) {
    const where = { isRead: false };
    
    if (targetType === 'user') {
      where.userId = targetId;
    } else if (targetType === 'venue_owner') {
      where.venueOwnerId = targetId;
    }
    
    return this.update(
      { 
        isRead: true, 
        readAt: new Date(),
        status: 'read'
      },
      { where }
    );
  };

  // Static factory methods for common notification types
  Notification.createBookingConfirmation = function(booking, user) {
    return this.create({
      title: '¡Reserva confirmada! ⚽',
      message: `Tu reserva para el ${booking.bookingDate} a las ${booking.startTime} ha sido confirmada. ¡Nos vemos en la cancha!`,
      type: 'booking_confirmed',
      priority: 'high',
      channels: ['app', 'sms'],
      targetType: 'user',
      userId: user.id,
      bookingId: booking.id,
      data: {
        bookingNumber: booking.bookingNumber,
        venueName: booking.Court?.Venue?.name,
        courtName: booking.Court?.name
      },
      actionButtons: [
        {
          text: 'Ver Reserva',
          action: 'view_booking',
          data: { bookingId: booking.id }
        }
      ]
    });
  };

  Notification.createBookingReminder = function(booking, user) {
    return this.create({
      title: 'Recordatorio: Tu partido es mañana ⚽',
      message: `No olvides tu reserva para mañana ${booking.bookingDate} a las ${booking.startTime}. ¡Te esperamos!`,
      type: 'booking_reminder',
      priority: 'medium',
      channels: ['app', 'sms'],
      targetType: 'user',
      userId: user.id,
      bookingId: booking.id,
      scheduledFor: new Date(new Date(`${booking.bookingDate} ${booking.startTime}`).getTime() - 24 * 60 * 60 * 1000),
      data: {
        bookingNumber: booking.bookingNumber,
        venueName: booking.Court?.Venue?.name,
        courtName: booking.Court?.name
      }
    });
  };

  return Notification;
};
