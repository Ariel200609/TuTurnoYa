module.exports = (sequelize, DataTypes) => {
  const Venue = sequelize.define('Venue', {
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
        len: [3, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Location information
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    neighborhood: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Bahía Blanca'
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Buenos Aires'
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Argentina'
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      validate: {
        min: -90,
        max: 90
      }
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      validate: {
        min: -180,
        max: 180
      }
    },
    // Contact information
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
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
    // Amenities and features
    amenities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      // Examples: ['Estacionamiento', 'Vestuarios', 'Buffet', 'Iluminación', 'Seguridad']
    },
    hasParking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasChangingRooms: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasShower: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasCafeteria: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasLighting: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasSecurity: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Operating hours
    operatingHours: {
      type: DataTypes.JSONB,
      defaultValue: {
        monday: { open: '08:00', close: '23:00', isOpen: true },
        tuesday: { open: '08:00', close: '23:00', isOpen: true },
        wednesday: { open: '08:00', close: '23:00', isOpen: true },
        thursday: { open: '08:00', close: '23:00', isOpen: true },
        friday: { open: '08:00', close: '23:00', isOpen: true },
        saturday: { open: '08:00', close: '23:00', isOpen: true },
        sunday: { open: '08:00', close: '23:00', isOpen: true }
      }
    },
    // Pricing and policies
    cancellationPolicy: {
      type: DataTypes.JSONB,
      defaultValue: {
        hoursBeforeCancel: 24,
        refundPercentage: 100,
        description: 'Cancelación gratuita hasta 24hs antes'
      }
    },
    // Status and verification
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isFeatured: {
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
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    popularityScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // Owner reference
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'venue_owners',
        key: 'id'
      }
    }
  }, {
    tableName: 'venues',
    timestamps: true,
    indexes: [
      {
        fields: ['ownerId']
      },
      {
        fields: ['city', 'state']
      },
      {
        fields: ['neighborhood']
      },
      {
        fields: ['isActive', 'isVerified']
      },
      {
        fields: ['averageRating']
      },
      {
        fields: ['popularityScore']
      },
      {
        fields: ['latitude', 'longitude']
      }
    ]
  });

  // Instance methods
  Venue.prototype.getFullAddress = function() {
    return `${this.address}, ${this.neighborhood ? this.neighborhood + ', ' : ''}${this.city}, ${this.state}`;
  };

  Venue.prototype.isOpenNow = function() {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    const todayHours = this.operatingHours[day];
    if (!todayHours || !todayHours.isOpen) {
      return false;
    }

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  Venue.prototype.calculateDistance = function(lat, lng) {
    if (!this.latitude || !this.longitude || !lat || !lng) {
      return null;
    }

    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat - this.latitude) * Math.PI / 180;
    const dLng = (lng - this.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Class methods
  Venue.findByOwner = function(ownerId) {
    return this.findAll({
      where: { ownerId, isActive: true }
    });
  };

  Venue.findNearby = function(lat, lng, radiusKm = 10) {
    // Simple bounding box search (for more precision, use PostGIS)
    const latDelta = radiusKm / 111; // Rough conversion
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    return this.findAll({
      where: {
        latitude: {
          [sequelize.Sequelize.Op.between]: [lat - latDelta, lat + latDelta]
        },
        longitude: {
          [sequelize.Sequelize.Op.between]: [lng - lngDelta, lng + lngDelta]
        },
        isActive: true,
        isVerified: true
      }
    });
  };

  return Venue;
};
