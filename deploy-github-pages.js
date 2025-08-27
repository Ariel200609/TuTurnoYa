#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Desplegando TuTurnoYa a GitHub Pages...\n');

function runCommand(command, options = {}) {
  try {
    console.log(`📋 Ejecutando: ${command}`);
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

// Verificar que estamos en la carpeta correcta
if (!fs.existsSync('frontend/package.json')) {
  console.error('❌ Ejecutá desde la carpeta raíz del proyecto (que contiene frontend/)');
  process.exit(1);
}

console.log('✅ Ubicación correcta detectada\n');

// Cambiar al directorio frontend
process.chdir('frontend');

console.log('📦 Instalando dependencias...');
if (!runCommand('npm install')) {
  console.error('❌ Error instalando dependencias');
  process.exit(1);
}

console.log('🔧 Creando build de producción...');
if (!runCommand('npm run build')) {
  console.error('❌ Error creando build');
  process.exit(1);
}

console.log('🚀 Desplegando a GitHub Pages...');
if (!runCommand('npm run deploy')) {
  console.error('❌ Error desplegando a GitHub Pages');
  process.exit(1);
}

console.log('\n✅ ¡Despliegue completado!');
console.log('🌐 Tu aplicación estará disponible en:');
console.log('   https://TU_USUARIO.github.io/TU_REPOSITORIO');
console.log('\n💡 Reemplazá TU_USUARIO y TU_REPOSITORIO por tus datos reales');
console.log('💡 Podés ver el estado del despliegue en: Settings > Pages de tu repositorio');
