module.exports = (sequelize, DataTypes) => {
  const Court = sequelize.define('Court', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Court specifications
    courtType: {
      type: DataTypes.ENUM('Fútbol 11', 'Fútbol 8', 'Fútbol 7', 'Fútbol 5', 'Futsal', 'Tenis', 'Padel', 'Básquet', 'Vóley'),
      allowNull: false,
      defaultValue: 'Fútbol 5'
    },
    surfaceType: {
      type: DataTypes.ENUM('Césped Natural', 'Césped Sintético', 'Cemento', 'Parquet', 'Tierra Batida', 'Polvo de Ladrillo'),
      allowNull: false,
      defaultValue: 'Césped Sintético'
    },
    dimensions: {
      type: DataTypes.JSONB,
      defaultValue: {
        length: 40, // meters
        width: 20,  // meters
        unit: 'meters'
      }
    },
    // Capacity and equipment
    maxPlayers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: {
        min: 2,
        max: 22
      }
    },
    hasRoof: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasLighting: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasGoals: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    hasNet: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Included equipment
    includedEquipment: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
      // Examples: ['Pelotas', 'Chalecos', 'Arcos', 'Red']
    },
    // Images
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    mainImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Pricing
    basePrice: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    // Price variations by time slot
    priceRules: {
      type: DataTypes.JSONB,
      defaultValue: {
        weekday: {
          morning: { multiplier: 0.8, label: 'Matutino (hasta 12:00)' },
          afternoon: { multiplier: 1.0, label: 'Tarde (12:00-18:00)' },
          night: { multiplier: 1.2, label: 'Nocturno (18:00+)' }
        },
        weekend: {
          morning: { multiplier: 1.0, label: 'Matutino (hasta 12:00)' },
          afternoon: { multiplier: 1.2, label: 'Tarde (12:00-18:00)' },
          night: { multiplier: 1.4, label: 'Nocturno (18:00+)' }
        }
      }
    },
    // Booking settings
    minBookingDuration: {
      type: DataTypes.INTEGER,
      defaultValue: 60, // minutes
      validate: {
        min: 30,
        max: 180
      }
    },
    maxBookingDuration: {
      type: DataTypes.INTEGER,
      defaultValue: 120, // minutes
      validate: {
        min: 60,
        max: 480
      }
    },
    bookingSlotDuration: {
      type: DataTypes.INTEGER,
      defaultValue: 60, // minutes - increment for booking slots
      validate: {
        min: 30,
        max: 120
      }
    },
    advanceBookingDays: {
      type: DataTypes.INTEGER,
      defaultValue: 30, // how many days in advance bookings are allowed
      validate: {
        min: 1,
        max: 365
      }
    },
    // Availability
    availabilityRules: {
      type: DataTypes.JSONB,
      defaultValue: {
        monday: { start: '08:00', end: '23:00', available: true },
        tuesday: { start: '08:00', end: '23:00', available: true },
        wednesday: { start: '08:00', end: '23:00', available: true },
        thursday: { start: '08:00', end: '23:00', available: true },
        friday: { start: '08:00', end: '23:00', available: true },
        saturday: { start: '08:00', end: '23:00', available: true },
        sunday: { start: '08:00', end: '23:00', available: true }
      }
    },
    // Blocked dates/times
    blockedSlots: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
      defaultValue: []
      // Format: [{ date: '2024-01-15', startTime: '10:00', endTime: '12:00', reason: 'Mantenimiento' }]
    },
    // Status
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    maintenanceMode: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Statistics
    totalBookings: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalRevenue: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00
    },
    popularityScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastMaintenanceAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Venue reference
    venueId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'venues',
        key: 'id'
      }
    }
  }, {
    tableName: 'courts',
    timestamps: true,
    indexes: [
      {
        fields: ['venueId']
      },
      {
        fields: ['courtType']
      },
      {
        fields: ['surfaceType']
      },
      {
        fields: ['isActive', 'isAvailable']
      },
      {
        fields: ['basePrice']
      },
      {
        fields: ['averageRating']
      },
      {
        fields: ['popularityScore']
      }
    ]
  });

  // Instance methods
  Court.prototype.calculatePrice = function(date, startTime, duration = 60) {
    const bookingDate = new Date(date);
    const isWeekend = bookingDate.getDay() === 0 || bookingDate.getDay() === 6; // Sunday or Saturday
    const hour = parseInt(startTime.split(':')[0]);
    
    let timeSlot = 'afternoon';
    if (hour < 12) timeSlot = 'morning';
    else if (hour >= 18) timeSlot = 'night';
    
    const ruleKey = isWeekend ? 'weekend' : 'weekday';
    const multiplier = this.priceRules[ruleKey][timeSlot].multiplier;
    
    const hours = duration / 60;
    return parseFloat((this.basePrice * multiplier * hours).toFixed(2));
  };

  Court.prototype.isAvailableAt = function(date, startTime, endTime) {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const dayRule = this.availabilityRules[dayOfWeek];
    
    if (!dayRule || !dayRule.available) {
      return false;
    }
    
    if (startTime < dayRule.start || endTime > dayRule.end) {
      return false;
    }
    
    // Check for blocked slots
    const dateStr = date.toISOString().split('T')[0];
    const hasBlockedSlot = this.blockedSlots.some(slot => {
      return slot.date === dateStr && 
             !(endTime <= slot.startTime || startTime >= slot.endTime);
    });
    
    return !hasBlockedSlot;
  };

  Court.prototype.getAvailableSlots = function(date) {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const dayRule = this.availabilityRules[dayOfWeek];
    
    if (!dayRule || !dayRule.available) {
      return [];
    }
    
    const slots = [];
    const startHour = parseInt(dayRule.start.split(':')[0]);
    const endHour = parseInt(dayRule.end.split(':')[0]);
    const slotDuration = this.bookingSlotDuration;
    
    for (let hour = startHour; hour < endHour; hour += slotDuration / 60) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + slotDuration / 60).toString().padStart(2, '0')}:00`;
      
      if (this.isAvailableAt(date, startTime, endTime)) {
        slots.push({
          startTime,
          endTime,
          price: this.calculatePrice(date, startTime, slotDuration)
        });
      }
    }
    
    return slots;
  };

  // Class methods
  Court.findByVenue = function(venueId) {
    return this.findAll({
      where: { venueId, isActive: true }
    });
  };

  Court.findAvailable = function(venueId, date, startTime, duration) {
    return this.findAll({
      where: {
        venueId,
        isActive: true,
        isAvailable: true,
        maintenanceMode: false
      }
    }).then(courts => {
      return courts.filter(court => 
        court.isAvailableAt(date, startTime, 
          new Date(new Date(`${date} ${startTime}`).getTime() + duration * 60000)
            .toTimeString().slice(0, 5)
        )
      );
    });
  };

  return Court;
};
