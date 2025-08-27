// Datos de ejemplo para funcionar en GitHub Pages sin backend

export const demoVenues = [
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
    isVerified: true,
    coordinates: { lat: -38.7183, lng: -62.2669 },
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
    ],
    courts: [
      {
        id: '1',
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
        name: 'Cancha de Básquet',
        courtType: 'Básquet',
        surfaceType: 'Parquet',
        basePrice: 3000,
        maxPlayers: 10,
        hasLighting: true,
        isActive: true
      }
    ]
  },
  {
    id: '2',
    name: 'Club Deportivo El Estadio',
    address: 'Belgrano 567, Bahía Blanca',
    neighborhood: 'Villa Mitre',
    city: 'Bahía Blanca',
    phoneNumber: '+5402914567891',
    description: 'Club tradicional con excelentes instalaciones para fútbol y deportes en general.',
    amenities: ['Estacionamiento', 'Vestuarios', 'Bar', 'Iluminación'],
    averageRating: 4.2,
    totalReviews: 15,
    isActive: true,
    isVerified: true,
    coordinates: { lat: -38.7150, lng: -62.2580 },
    images: [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
    ],
    courts: [
      {
        id: '3',
        name: 'Cancha Principal',
        courtType: 'Fútbol 5',
        surfaceType: 'Césped Sintético',
        basePrice: 3200,
        maxPlayers: 10,
        hasLighting: true,
        isActive: true
      }
    ]
  },
  {
    id: '3',
    name: 'Complejo Bahía Sport',
    address: 'Ruta 3 Km 8, Bahía Blanca',
    neighborhood: 'Ing. White',
    city: 'Bahía Blanca',
    phoneNumber: '+5402914567892',
    description: 'Moderno complejo con canchas de última generación y amplias instalaciones.',
    amenities: ['Estacionamiento', 'Vestuarios', 'Buffet', 'Iluminación', 'Quincho', 'Parrillas'],
    averageRating: 4.7,
    totalReviews: 42,
    isActive: true,
    isVerified: true,
    coordinates: { lat: -38.7320, lng: -62.2180 },
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
    ],
    courts: [
      {
        id: '4',
        name: 'Cancha Sintética 1',
        courtType: 'Fútbol 5',
        surfaceType: 'Césped Sintético',
        basePrice: 4000,
        maxPlayers: 10,
        hasLighting: true,
        isActive: true
      }
    ]
  }
];

export const demoUsers = {
  user: {
    id: '1',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'user@demo.com',
    phoneNumber: '+5491123456789',
    isPhoneVerified: true,
    isActive: true
  },
  owner: {
    id: '1',
    firstName: 'María',
    lastName: 'González',
    email: 'owner@demo.com',
    phoneNumber: '+5491123456790',
    isVerified: true,
    isActive: true
  },
  admin: {
    id: '1',
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    email: 'admin@demo.com',
    role: 'admin',
    isActive: true
  }
};

export const demoStats = {
  totalUsers: 1250,
  totalVenues: 45,
  totalBookings: 3420,
  totalRevenue: 125000,
  weeklyGrowth: 12.5,
  monthlyGrowth: 35.2
};
