module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // Rating (1-5 stars)
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    // Detailed ratings
    courtConditionRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    facilitiesRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    serviceRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    valueForMoneyRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    // Written review
    title: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 200]
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      }
    },
    // Categories/tags
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
      // Examples: ['Excelente estado', 'Buena iluminación', 'Buen precio', 'Personal amable']
    },
    // Photos uploaded with review
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    // Review metadata
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true // User must have completed booking to review
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Moderation
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isFlagged: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    flaggedReason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    moderatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'admins',
        key: 'id'
      }
    },
    moderatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Venue owner response
    ownerResponse: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ownerResponseAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Helpfulness tracking
    helpfulVotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    unhelpfulVotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // Language and location context
    language: {
      type: DataTypes.STRING,
      defaultValue: 'es'
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
    venueId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'venues',
        key: 'id'
      }
    },
    bookingId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // One review per booking
      references: {
        model: 'bookings',
        key: 'id'
      }
    }
  }, {
    tableName: 'reviews',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['venueId']
      },
      {
        fields: ['bookingId']
      },
      {
        fields: ['rating']
      },
      {
        fields: ['isApproved', 'isFlagged']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  // Instance methods
  Review.prototype.getDisplayName = function() {
    if (this.isAnonymous || !this.User) {
      return 'Usuario Anónimo';
    }
    return this.User.getFullName();
  };

  Review.prototype.calculateOverallRating = function() {
    const ratings = [
      this.courtConditionRating,
      this.facilitiesRating,
      this.serviceRating,
      this.valueForMoneyRating
    ].filter(rating => rating !== null);

    if (ratings.length === 0) {
      return this.rating;
    }

    const sum = ratings.reduce((total, rating) => total + rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal place
  };

  Review.prototype.getHelpfulnessScore = function() {
    const total = this.helpfulVotes + this.unhelpfulVotes;
    if (total === 0) return 0;
    return (this.helpfulVotes / total) * 100;
  };

  Review.prototype.canBeEditedBy = function(userId) {
    return this.userId === userId && this.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
  };

  Review.prototype.flag = async function(reason, moderatorId = null) {
    this.isFlagged = true;
    this.flaggedReason = reason;
    if (moderatorId) {
      this.moderatedBy = moderatorId;
      this.moderatedAt = new Date();
    }
    return this.save();
  };

  Review.prototype.approve = async function(moderatorId) {
    this.isApproved = true;
    this.isFlagged = false;
    this.flaggedReason = null;
    this.moderatedBy = moderatorId;
    this.moderatedAt = new Date();
    return this.save();
  };

  Review.prototype.addOwnerResponse = async function(response) {
    this.ownerResponse = response;
    this.ownerResponseAt = new Date();
    return this.save();
  };

  // Class methods
  Review.findByVenue = function(venueId, options = {}) {
    const where = { 
      venueId, 
      isApproved: true, 
      isFlagged: false 
    };
    
    const order = options.sortBy === 'rating' ? 
      [['rating', options.sortOrder || 'DESC']] :
      [['createdAt', options.sortOrder || 'DESC']];

    return this.findAndCountAll({
      where,
      order,
      limit: options.limit || 20,
      offset: options.offset || 0,
      include: options.includeUser ? [
        {
          model: sequelize.models.User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        }
      ] : []
    });
  };

  Review.findByUser = function(userId) {
    return this.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: sequelize.models.Venue,
          as: 'venue',
          attributes: ['id', 'name', 'mainImage']
        }
      ]
    });
  };

  Review.calculateVenueStats = async function(venueId) {
    const reviews = await this.findAll({
      where: { 
        venueId, 
        isApproved: true, 
        isFlagged: false 
      }
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        categoryAverages: {
          courtCondition: 0,
          facilities: 0,
          service: 0,
          valueForMoney: 0
        }
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating] = (dist[review.rating] || 0) + 1;
      return dist;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    // Calculate category averages
    const categoryAverages = ['courtConditionRating', 'facilitiesRating', 'serviceRating', 'valueForMoneyRating']
      .reduce((averages, category) => {
        const validRatings = reviews
          .map(r => r[category])
          .filter(rating => rating !== null);
        
        const key = category.replace('Rating', '').replace(/([A-Z])/g, (match, p1, offset) => 
          offset > 0 ? match : match.toLowerCase()
        );
        
        averages[key] = validRatings.length > 0 ?
          Math.round((validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length) * 10) / 10 :
          0;
        
        return averages;
      }, {});

    return {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution,
      categoryAverages
    };
  };

  Review.findFlaggedForModeration = function() {
    return this.findAll({
      where: { isFlagged: true },
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: sequelize.models.User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: sequelize.models.Venue,
          as: 'venue',
          attributes: ['id', 'name']
        }
      ]
    });
  };

  // Hooks
  Review.addHook('afterCreate', async (review) => {
    // Update venue average rating
    const stats = await Review.calculateVenueStats(review.venueId);
    await sequelize.models.Venue.update(
      { 
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews
      },
      { where: { id: review.venueId } }
    );
  });

  Review.addHook('afterUpdate', async (review) => {
    if (review.changed('rating') || review.changed('isApproved') || review.changed('isFlagged')) {
      const stats = await Review.calculateVenueStats(review.venueId);
      await sequelize.models.Venue.update(
        { 
          averageRating: stats.averageRating,
          totalReviews: stats.totalReviews
        },
        { where: { id: review.venueId } }
      );
    }
  });

  return Review;
};
