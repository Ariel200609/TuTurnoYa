const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import configuration
const devConfig = require('./config/development');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const venueRoutes = require('./routes/venues');
const courtRoutes = require('./routes/courts');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

// Import database (only if not in demo mode)
let sequelize = null;
try {
  if (!devConfig.demoMode) {
    sequelize = require('./models').sequelize;
  }
} catch (error) {
  console.log('⚠️  Base de datos no disponible - continuando en modo demo');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Demasiadas solicitudes, intenta nuevamente en 15 minutos'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Demo mode routes (for quick testing without database)
if (devConfig.demoMode) {
  console.log('🎯 Ejecutando en MODO DEMO - Usando datos de ejemplo');
  
  // Demo venues endpoint
  app.get('/api/venues', (req, res) => {
    const venues = devConfig.sampleData.venues.map(venue => ({
      ...venue,
      courts: devConfig.sampleData.courts.filter(court => court.venueId === venue.id)
    }));
    
    res.json({
      success: true,
      venues,
      pagination: {
        total: venues.length,
        page: 1,
        pages: 1,
        limit: 12
      }
    });
  });

  // Demo single venue endpoint
  app.get('/api/venues/:id', (req, res) => {
    const venue = devConfig.sampleData.venues.find(v => v.id === req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue no encontrado' });
    }
    
    const venueWithCourts = {
      ...venue,
      courts: devConfig.sampleData.courts.filter(court => court.venueId === venue.id),
      reviews: [],
      reviewStats: {
        averageRating: venue.averageRating,
        totalReviews: venue.totalReviews,
        ratingDistribution: { 1: 0, 2: 2, 3: 5, 4: 8, 5: 13 }
      }
    };
    
    res.json({
      success: true,
      venue: venueWithCourts
    });
  });

  // Demo auth endpoint (simplified)
  app.post('/api/auth/demo-login', (req, res) => {
    const { email, type = 'user' } = req.body;
    
    const users = {
      'user@demo.com': { 
        id: '1', 
        firstName: 'Juan', 
        lastName: 'Demo', 
        email: 'user@demo.com',
        phoneNumber: '+5492911234567',
        type: 'user' 
      },
      'owner@demo.com': { 
        id: '2', 
        firstName: 'María', 
        lastName: 'Propietaria', 
        email: 'owner@demo.com',
        businessName: 'Mi Complejo',
        type: 'venue_owner' 
      },
      'admin@demo.com': { 
        id: '3', 
        firstName: 'Carlos', 
        lastName: 'Admin', 
        email: 'admin@demo.com',
        type: 'admin' 
      }
    };

    const user = users[email];
    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      token: 'demo_token_' + user.id,
      user,
      userType: user.type,
      message: 'Login demo exitoso'
    });
  });

  // Demo health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      message: 'TuTurnoYa API funcionando en MODO DEMO',
      mode: 'DEMO',
      timestamp: new Date().toISOString() 
    });
  });
}

// API Routes (normal mode)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'TuTurnoYa API funcionando correctamente',
    timestamp: new Date().toISOString() 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Database connection and server start
const startServer = async () => {
  try {
    if (devConfig.demoMode) {
      console.log('🎯 Iniciando en MODO DEMO - Sin base de datos requerida');
      app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en puerto ${PORT} (MODO DEMO)`);
        console.log(`⚽ TuTurnoYa - Plataforma de Reservas de Canchas`);
        console.log(`🌐 API disponible en: http://localhost:${PORT}/api`);
        console.log(`📝 Usa estos datos para probar:`);
        console.log(`   - Usuarios: user@demo.com, owner@demo.com, admin@demo.com`);
        console.log(`   - Venues de ejemplo cargados automáticamente`);
      });
    } else if (sequelize) {
      await sequelize.authenticate();
      console.log('✅ Conexión a PostgreSQL establecida correctamente.');
      
      // Sync database in development
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
        console.log('🔄 Base de datos sincronizada.');
      }

      app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
        console.log(`⚽ TuTurnoYa - Plataforma de Reservas de Canchas`);
        console.log(`🌐 API disponible en: http://localhost:${PORT}/api`);
      });
    } else {
      // Start without database (full demo mode)
      app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en puerto ${PORT} (MODO DEMO COMPLETO)`);
        console.log(`⚽ TuTurnoYa - Plataforma de Reservas de Canchas`);
        console.log(`🌐 API disponible en: http://localhost:${PORT}/api`);
        console.log(`📝 Sin base de datos - usando datos de ejemplo en memoria`);
      });
    }
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    console.log('💡 Tip: Para prueba rápida, deja las variables de entorno vacías para usar el modo demo');
    process.exit(1);
  }
};

startServer();

module.exports = app;
