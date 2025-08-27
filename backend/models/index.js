const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
}

// Import models
const User = require('./User')(sequelize, Sequelize.DataTypes);
const VenueOwner = require('./VenueOwner')(sequelize, Sequelize.DataTypes);
const Admin = require('./Admin')(sequelize, Sequelize.DataTypes);
const Venue = require('./Venue')(sequelize, Sequelize.DataTypes);
const Court = require('./Court')(sequelize, Sequelize.DataTypes);
const Booking = require('./Booking')(sequelize, Sequelize.DataTypes);
const Notification = require('./Notification')(sequelize, Sequelize.DataTypes);
const Review = require('./Review')(sequelize, Sequelize.DataTypes);

// Define associations
const db = {
  User,
  VenueOwner,
  Admin,
  Venue,
  Court,
  Booking,
  Notification,
  Review,
  sequelize,
  Sequelize
};

// User associations
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

// VenueOwner associations
VenueOwner.hasMany(Venue, { foreignKey: 'ownerId', as: 'venues' });
VenueOwner.hasMany(Notification, { foreignKey: 'venueOwnerId', as: 'notifications' });

// Venue associations
Venue.belongsTo(VenueOwner, { foreignKey: 'ownerId', as: 'owner' });
Venue.hasMany(Court, { foreignKey: 'venueId', as: 'courts' });
Venue.hasMany(Review, { foreignKey: 'venueId', as: 'reviews' });

// Court associations
Court.belongsTo(Venue, { foreignKey: 'venueId', as: 'venue' });
Court.hasMany(Booking, { foreignKey: 'courtId', as: 'bookings' });

// Booking associations
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Booking.belongsTo(Court, { foreignKey: 'courtId', as: 'court' });
Booking.hasOne(Review, { foreignKey: 'bookingId', as: 'review' });

// Review associations
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Review.belongsTo(Venue, { foreignKey: 'venueId', as: 'venue' });
Review.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(VenueOwner, { foreignKey: 'venueOwnerId', as: 'venueOwner' });
Notification.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

module.exports = db;
