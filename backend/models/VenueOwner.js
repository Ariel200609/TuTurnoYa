const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const VenueOwner = sequelize.define('VenueOwner', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50]
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        is: /^\+?[1-9]\d{1,14}$/
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100]
      }
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    businessType: {
      type: DataTypes.ENUM('Complejo Deportivo', 'Club', 'Gimnasio', 'Centro Recreativo', 'Otro'),
      defaultValue: 'Complejo Deportivo'
    },
    taxId: {
      type: DataTypes.STRING,
      allowNull: true, // CUIT/CUIL in Argentina
      validate: {
        is: /^\d{11}$/ // 11 digits for Argentine tax ID
      }
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationDocuments: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 4), // e.g., 0.1000 for 10%
      defaultValue: 0.1000,
      validate: {
        min: 0,
        max: 1
      }
    },
    // Bank account info for payments
    bankAccountInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null
    },
    // Business address
    businessAddress: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null
    },
    // Notification preferences
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    smsNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    registrationCompletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'venue_owners',
    timestamps: true,
    indexes: [
      {
        fields: ['email']
      },
      {
        fields: ['phoneNumber']
      },
      {
        fields: ['taxId']
      },
      {
        fields: ['isActive', 'isVerified']
      }
    ]
  });

  // Instance methods
  VenueOwner.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
  };

  VenueOwner.prototype.toSafeJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.bankAccountInfo; // Sensitive data
    return values;
  };

  VenueOwner.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  // Class methods
  VenueOwner.findByEmail = function(email) {
    return this.findOne({
      where: { email: email.toLowerCase() }
    });
  };

  // Hooks
  VenueOwner.addHook('beforeSave', async (venueOwner) => {
    if (venueOwner.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      venueOwner.password = await bcrypt.hash(venueOwner.password, salt);
    }
    if (venueOwner.changed('email')) {
      venueOwner.email = venueOwner.email.toLowerCase();
    }
    if (venueOwner.phoneNumber && !venueOwner.phoneNumber.startsWith('+')) {
      venueOwner.phoneNumber = '+54' + venueOwner.phoneNumber;
    }
  });

  return VenueOwner;
};
