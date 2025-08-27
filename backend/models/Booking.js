module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    bookingNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
      // Format: TY-YYYYMMDD-XXXX (TY = TuTurnoYa, date, sequential number)
    },
    // Booking details
    bookingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 30,
        max: 480 // 8 hours max
      }
    },
    // Pricing
    basePrice: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    priceMultiplier: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 1.00
    },
    totalPrice: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.1000
    },
    commissionAmount: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    venueAmount: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    // Players information
    playerCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 22
      }
    },
    players: {
      type: DataTypes.JSONB,
      defaultValue: []
      // Array of player objects: [{ name, phone, position }]
    },
    // Contact information
    contactName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    // Special requests
    specialRequests: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    equipmentRequested: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    // Status
    status: {
      type: DataTypes.ENUM(
        'pending',     // Waiting for venue confirmation
        'confirmed',   // Confirmed by venue
        'paid',        // Payment completed
        'cancelled',   // Cancelled by user
        'rejected',    // Rejected by venue
        'completed',   // Booking completed
        'no_show'      // User didn't show up
      ),
      allowNull: false,
      defaultValue: 'pending'
    },
    autoConfirm: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Payment information
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'partial_refund'),
      defaultValue: 'pending'
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'credit_card', 'debit_card', 'bank_transfer', 'mercado_pago'),
      allowNull: true
    },
    paymentId: {
      type: DataTypes.STRING,
      allowNull: true // External payment processor ID
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Cancellation
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancelledBy: {
      type: DataTypes.ENUM('user', 'venue', 'admin', 'system'),
      allowNull: true
    },
    refundAmount: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true
    },
    // Confirmation and reminders
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reminderSentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    checkInAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Weather and conditions (automatically set)
    weatherConditions: {
      type: DataTypes.JSONB,
      allowNull: true
      // { temperature, humidity, wind, description, icon }
    },
    // References
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    courtId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courts',
        key: 'id'
      }
    }
  }, {
    tableName: 'bookings',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['courtId']
      },
      {
        fields: ['bookingDate', 'startTime']
      },
      {
        fields: ['status']
      },
      {
        fields: ['paymentStatus']
      },
      {
        fields: ['bookingNumber']
      },
      {
        unique: true,
        fields: ['courtId', 'bookingDate', 'startTime']
      }
    ]
  });

  // Instance methods
  Booking.prototype.canBeCancelled = function() {
    if (!['pending', 'confirmed', 'paid'].includes(this.status)) {
      return false;
    }
    
    const bookingDateTime = new Date(`${this.bookingDate} ${this.startTime}`);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
    
    return hoursUntilBooking > 24; // Must be more than 24 hours in advance
  };

  Booking.prototype.calculateRefundAmount = function() {
    if (!this.canBeCancelled()) {
      return 0;
    }
    
    const bookingDateTime = new Date(`${this.bookingDate} ${this.startTime}`);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
    
    if (hoursUntilBooking >= 24) {
      return this.totalPrice; // Full refund
    } else if (hoursUntilBooking >= 12) {
      return this.totalPrice * 0.5; // 50% refund
    } else {
      return 0; // No refund
    }
  };

  Booking.prototype.isUpcoming = function() {
    const bookingDateTime = new Date(`${this.bookingDate} ${this.startTime}`);
    return bookingDateTime > new Date();
  };

  Booking.prototype.isPast = function() {
    const bookingDateTime = new Date(`${this.bookingDate} ${this.endTime}`);
    return bookingDateTime < new Date();
  };

  Booking.prototype.getTimeUntilBooking = function() {
    const bookingDateTime = new Date(`${this.bookingDate} ${this.startTime}`);
    const now = new Date();
    return bookingDateTime - now;
  };

  Booking.prototype.shouldSendReminder = function() {
    if (this.status !== 'confirmed' && this.status !== 'paid') {
      return false;
    }
    
    if (this.reminderSentAt) {
      return false; // Already sent
    }
    
    const timeUntilBooking = this.getTimeUntilBooking();
    const hoursUntil = timeUntilBooking / (1000 * 60 * 60);
    
    return hoursUntil <= 24 && hoursUntil > 0; // Send reminder 24 hours before
  };

  // Class methods
  Booking.generateBookingNumber = async function() {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const lastBooking = await this.findOne({
      where: {
        bookingNumber: {
          [sequelize.Sequelize.Op.like]: `TY-${today}-%`
        }
      },
      order: [['bookingNumber', 'DESC']]
    });
    
    let sequence = 1;
    if (lastBooking) {
      const lastSequence = parseInt(lastBooking.bookingNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    return `TY-${today}-${sequence.toString().padStart(4, '0')}`;
  };

  Booking.findByUser = function(userId, status = null) {
    const where = { userId };
    if (status) where.status = status;
    
    return this.findAll({
      where,
      order: [['bookingDate', 'DESC'], ['startTime', 'DESC']]
    });
  };

  Booking.findByCourt = function(courtId, date = null) {
    const where = { courtId };
    if (date) where.bookingDate = date;
    
    return this.findAll({
      where,
      order: [['bookingDate', 'ASC'], ['startTime', 'ASC']]
    });
  };

  Booking.findConflicting = function(courtId, bookingDate, startTime, endTime, excludeId = null) {
    const where = {
      courtId,
      bookingDate,
      status: {
        [sequelize.Sequelize.Op.in]: ['pending', 'confirmed', 'paid']
      },
      [sequelize.Sequelize.Op.or]: [
        {
          startTime: {
            [sequelize.Sequelize.Op.between]: [startTime, endTime]
          }
        },
        {
          endTime: {
            [sequelize.Sequelize.Op.between]: [startTime, endTime]
          }
        },
        {
          [sequelize.Sequelize.Op.and]: [
            {
              startTime: {
                [sequelize.Sequelize.Op.lte]: startTime
              }
            },
            {
              endTime: {
                [sequelize.Sequelize.Op.gte]: endTime
              }
            }
          ]
        }
      ]
    };
    
    if (excludeId) {
      where.id = { [sequelize.Sequelize.Op.ne]: excludeId };
    }
    
    return this.findAll({ where });
  };

  // Hooks
  Booking.addHook('beforeCreate', async (booking) => {
    if (!booking.bookingNumber) {
      booking.bookingNumber = await Booking.generateBookingNumber();
    }
    
    // Calculate amounts
    booking.commissionAmount = booking.totalPrice * booking.commissionRate;
    booking.venueAmount = booking.totalPrice - booking.commissionAmount;
  });

  Booking.addHook('beforeUpdate', (booking) => {
    if (booking.changed('totalPrice') || booking.changed('commissionRate')) {
      booking.commissionAmount = booking.totalPrice * booking.commissionRate;
      booking.venueAmount = booking.totalPrice - booking.commissionAmount;
    }
  });

  return Booking;
};
