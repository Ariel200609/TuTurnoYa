const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        is: /^\+?[1-9]\d{1,14}$/  // Basic international phone format
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    preferredPosition: {
      type: DataTypes.ENUM('Arquero', 'Defensor', 'Mediocampista', 'Delantero', 'Sin Preferencia'),
      defaultValue: 'Sin Preferencia'
    },
    skillLevel: {
      type: DataTypes.ENUM('Principiante', 'Intermedio', 'Avanzado', 'Profesional'),
      defaultValue: 'Intermedio'
    },
    favoriteVenues: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: []
    },
    // Firebase UID for authentication
    firebaseUid: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    // SMS verification code (temporary storage)
    verificationCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    verificationCodeExpiry: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    totalBookings: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    cancelledBookings: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        fields: ['phoneNumber']
      },
      {
        fields: ['email']
      },
      {
        fields: ['firebaseUid']
      }
    ]
  });

  // Instance methods
  User.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
  };

  User.prototype.toSafeJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.verificationCode;
    delete values.verificationCodeExpiry;
    delete values.firebaseUid;
    return values;
  };

  // Class methods
  User.findByPhoneNumber = function(phoneNumber) {
    return this.findOne({
      where: { phoneNumber }
    });
  };

  User.findByFirebaseUid = function(firebaseUid) {
    return this.findOne({
      where: { firebaseUid }
    });
  };

  // Hooks
  User.addHook('beforeCreate', (user) => {
    // Normalize phone number format
    if (user.phoneNumber && !user.phoneNumber.startsWith('+')) {
      user.phoneNumber = '+54' + user.phoneNumber; // Default to Argentina
    }
  });

  return User;
};
