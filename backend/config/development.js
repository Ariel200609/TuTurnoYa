// Configuración simplificada para desarrollo rápido
module.exports = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'tuturno_ya_dev',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'development_secret_key_123',
    expire: process.env.JWT_EXPIRE || '7d'
  },
  
  // Modo demo - sin servicios externos necesarios
  demoMode: !process.env.FIREBASE_PROJECT_ID || !process.env.TWILIO_ACCOUNT_SID,
  
  // Datos de ejemplo para demo
  sampleData: {
    venues: [
      {
        id: '1',
        name: 'Complejo Deportivo La Cancha',
        address: 'Av. Alem 1234, Bahía Blanca',
        neighborhood: 'Centro',
        city: 'Bahía Blanca',
        phoneNumber: '+5402914567890',
        description: 'El mejor complejo multi-deportivo de la zona. Canchas de fútbol, tenis y básquet con todas las comodidades.',
        amenities: ['Estacionamiento', 'Vestuarios', 'Buffet', 'Iluminación', 'WiFi', 'Quincho'],
        averageRating: 4.5,
        totalReviews: 28,
        isActive: true,
        isVerified: true
      },
      {
        id: '2', 
        name: 'Futbol Club Norte',
        address: 'Calle Falsa 456, Bahía Blanca',
        neighborhood: 'Barrio Norte',
        city: 'Bahía Blanca',
        phoneNumber: '+5402919876543',
        description: 'Canchas de césped sintético de primera calidad',
        amenities: ['Estacionamiento', 'Vestuarios', 'Iluminación', 'Seguridad'],
        averageRating: 4.2,
        totalReviews: 15,
        isActive: true,
        isVerified: true
      },
      {
        id: '3',
        name: 'Sports Center',
        address: 'Roca 789, Bahía Blanca', 
        neighborhood: 'Villa Mitre',
        city: 'Bahía Blanca',
        phoneNumber: '+5402911234567',
        description: 'Variedad de canchas para todos los gustos',
        amenities: ['Vestuarios', 'Buffet', 'Iluminación'],
        averageRating: 3.8,
        totalReviews: 42,
        isActive: true,
        isVerified: true
      }
    ],
    
    courts: [
      {
        id: '1',
        venueId: '1',
        name: 'Cancha de Fútbol 5 A',
        courtType: 'Fútbol 5',
        surfaceType: 'Césped Sintético',
        basePrice: 3500,
        maxPlayers: 10,
        hasLighting: true,
        isActive: true
      },
      {
        id: '2',
        venueId: '1', 
        name: 'Cancha de Fútbol 7',
        courtType: 'Fútbol 7',
        surfaceType: 'Césped Sintético', 
        basePrice: 4500,
        maxPlayers: 14,
        hasLighting: true,
        isActive: true
      },
      {
        id: '5',
        venueId: '1',
        name: 'Cancha de Tenis 1',
        courtType: 'Tenis',
        surfaceType: 'Polvo de Ladrillo',
        basePrice: 2500,
        maxPlayers: 4,
        hasLighting: true,
        isActive: true
      },
      {
        id: '6',
        venueId: '1',
        name: 'Cancha de Básquet',
        courtType: 'Básquet',
        surfaceType: 'Parquet',
        basePrice: 3000,
        maxPlayers: 10,
        hasLighting: true,
        isActive: true
      },
      {
        id: '3',
        venueId: '2',
        name: 'Cancha Principal',
        courtType: 'Fútbol 5',
        surfaceType: 'Césped Natural',
        basePrice: 4000,
        maxPlayers: 10,
        hasLighting: true,
        isActive: true
      },
      {
        id: '4',
        venueId: '3',
        name: 'Cancha A',
        courtType: 'Fútbol 5',
        surfaceType: 'Cemento',
        basePrice: 2800,
        maxPlayers: 10,
        hasLighting: false,
        isActive: true
      }
    ]
  }
};
