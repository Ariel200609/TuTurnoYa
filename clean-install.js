#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Limpiando dependencias anteriores...\n');

// Función para eliminar directorio recursivamente (compatible con Windows)
function removeDir(dir) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Eliminado: ${dir}`);
    }
  } catch (error) {
    console.log(`⚠️  No se pudo eliminar ${dir}: ${error.message}`);
  }
}

// Eliminar carpetas node_modules
removeDir('node_modules');
removeDir('backend/node_modules');
removeDir('frontend/node_modules');

// Eliminar archivos de lock
const lockFiles = [
  'package-lock.json',
  'backend/package-lock.json', 
  'frontend/package-lock.json',
  'yarn.lock',
  'backend/yarn.lock',
  'frontend/yarn.lock'
];

lockFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✅ Eliminado: ${file}`);
    }
  } catch (error) {
    console.log(`⚠️  No se pudo eliminar ${file}`);
  }
});

console.log('\n🚀 Instalando dependencias limpias...\n');

try {
  // Instalar dependencias
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\n📂 Instalando dependencias del backend...\n');
  process.chdir('backend');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\n🖥️  Instalando dependencias del frontend...\n');
  process.chdir('../frontend');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  process.chdir('..');
  
  console.log('\n✅ ¡Instalación completa exitosa!');
  console.log('🚀 Ahora podés ejecutar: npm run demo\n');
  
} catch (error) {
  console.error('\n❌ Error durante la instalación:', error.message);
  console.log('\n💡 Intentá ejecutar manualmente:');
  console.log('   npm install');
  console.log('   cd backend && npm install');
  console.log('   cd ../frontend && npm install --legacy-peer-deps\n');
  process.exit(1);
}
