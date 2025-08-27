#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Configuración Rápida de TuTurnoYa\n');

// Crear archivo .env para el backend
const backendEnvContent = `# Configuración mínima para prueba rápida
# Deja estos valores vacíos para usar el modo demo sin base de datos

NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# JWT (requerido)
JWT_SECRET=demo_secret_key_for_testing_only
JWT_EXPIRE=7d

# Base de datos (opcional - modo demo si está vacío)
DATABASE_URL=
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASS=

# Servicios externos (opcional - modo demo si están vacíos)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

DEFAULT_COMMISSION_RATE=0.10
`;

// Crear archivo .env para el frontend
const frontendEnvContent = `REACT_APP_API_URL=http://localhost:5000/api
`;

try {
  // Crear .env del backend
  if (!fs.existsSync('backend/.env')) {
    fs.writeFileSync('backend/.env', backendEnvContent);
    console.log('✅ Archivo backend/.env creado');
  } else {
    console.log('⚠️  backend/.env ya existe, no se sobreescribió');
  }

  // Crear .env del frontend
  if (!fs.existsSync('frontend/.env')) {
    fs.writeFileSync('frontend/.env', frontendEnvContent);
    console.log('✅ Archivo frontend/.env creado');
  } else {
    console.log('⚠️  frontend/.env ya existe, no se sobreescribió');
  }

  console.log('\n🎯 Configuración completada para MODO DEMO');
  console.log('\nPara iniciar la aplicación:');
  console.log('  npm run dev\n');
  
  console.log('🔍 Datos de prueba disponibles:');
  console.log('  - Usuario: user@demo.com');
  console.log('  - Propietario: owner@demo.com');
  console.log('  - Admin: admin@demo.com');
  console.log('  - 3 venues de ejemplo en Bahía Blanca\n');

  console.log('💡 No se requiere base de datos ni servicios externos');
  console.log('   Todo funciona con datos de ejemplo en memoria\n');

} catch (error) {
  console.error('❌ Error en configuración:', error.message);
  process.exit(1);
}
