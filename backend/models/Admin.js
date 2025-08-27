const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 100]
      }
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'admin', 'moderator'),
      allowNull: false,
      defaultValue: 'admin'
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [
        'view_dashboard',
        'manage_users',
        'manage_venues',
        'manage_bookings',
        'view_reports'
      ]
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lockedUntil: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'admins',
    timestamps: true,
    indexes: [
      {
        fields: ['email']
      },
      {
        fields: ['role']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  // Instance methods
  Admin.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
  };

  Admin.prototype.toSafeJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  };

  Admin.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  Admin.prototype.hasPermission = function(permission) {
    return this.permissions.includes(permission) || this.role === 'super_admin';
  };

  Admin.prototype.isLocked = function() {
    return this.lockedUntil && this.lockedUntil > new Date();
  };

  Admin.prototype.incrementLoginAttempts = async function() {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
    }
    return this.save();
  };

  Admin.prototype.resetLoginAttempts = async function() {
    this.loginAttempts = 0;
    this.lockedUntil = null;
    this.lastLoginAt = new Date();
    return this.save();
  };

  // Class methods
  Admin.findByEmail = function(email) {
    return this.findOne({
      where: { email: email.toLowerCase(), isActive: true }
    });
  };

  // Hooks
  Admin.addHook('beforeSave', async (admin) => {
    if (admin.changed('password')) {
      const salt = await bcrypt.genSalt(12);
      admin.password = await bcrypt.hash(admin.password, salt);
    }
    if (admin.changed('email')) {
      admin.email = admin.email.toLowerCase();
    }
  });

  return Admin;
};
