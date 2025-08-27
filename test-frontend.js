#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 Diagnosticando problema del frontend...\n');

// Verificar ubicación
if (!fs.existsSync('frontend/package.json')) {
  console.error('❌ No estás en la carpeta raíz del proyecto');
  console.log('💡 Ejecutá este comando desde la carpeta que contiene frontend/');
  process.exit(1);
}

console.log('✅ Ubicación correcta\n');

// Verificar si react-scripts existe
console.log('🔍 Verificando react-scripts...');
if (fs.existsSync('frontend/node_modules/react-scripts/bin/react-scripts.js')) {
  console.log('✅ react-scripts encontrado');
} else {
  console.log('❌ react-scripts NO encontrado');
  console.log('🔧 Instalando react-scripts...\n');
  
  try {
    process.chdir('frontend');
    execSync('npm install react-scripts@5.0.1 --legacy-peer-deps --force', { stdio: 'inherit' });
    console.log('✅ react-scripts instalado');
    process.chdir('..');
  } catch (error) {
    console.error('❌ Error instalando react-scripts:', error.message);
    process.exit(1);
  }
}

// Verificar otras dependencias críticas
console.log('\n🔍 Verificando dependencias críticas...');
const criticalDeps = [
  'frontend/node_modules/react',
  'frontend/node_modules/react-dom',
  'frontend/node_modules/react-router-dom'
];

let missingDeps = [];
criticalDeps.forEach(dep => {
  if (!fs.existsSync(dep)) {
    missingDeps.push(dep.split('/').pop());
  }
});

if (missingDeps.length > 0) {
  console.log(`❌ Dependencias faltantes: ${missingDeps.join(', ')}`);
  console.log('🔧 Instalando dependencias faltantes...\n');
  
  try {
    process.chdir('frontend');
    execSync('npm install --legacy-peer-deps --force', { stdio: 'inherit' });
    console.log('✅ Dependencias instaladas');
    process.chdir('..');
  } catch (error) {
    console.error('❌ Error instalando dependencias:', error.message);
  }
} else {
  console.log('✅ Todas las dependencias críticas están presentes');
}

console.log('\n🚀 Intentando ejecutar frontend...');
console.log('💡 Si funciona, se abrirá automáticamente en http://localhost:3000');
console.log('💡 Si da error, usa Ctrl+C para parar y reporta el error\n');

try {
  process.chdir('frontend');
  execSync('npm start', { stdio: 'inherit' });
} catch (error) {
  console.log('\n❌ El frontend no puede ejecutarse');
  console.log('💡 Reporta este error para más ayuda');
}
