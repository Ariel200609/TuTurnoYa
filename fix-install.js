#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Arreglando problemas de instalación...\n');

// Función para ejecutar comandos con manejo de errores
function runCommand(command, directory = '.') {
  try {
    console.log(`📂 Ejecutando en ${directory}: ${command}`);
    const currentDir = process.cwd();
    if (directory !== '.') {
      process.chdir(directory);
    }
    execSync(command, { stdio: 'inherit' });
    if (directory !== '.') {
      process.chdir(currentDir);
    }
    return true;
  } catch (error) {
    console.error(`❌ Error ejecutando: ${command}`);
    if (directory !== '.') {
      process.chdir(process.cwd());
    }
    return false;
  }
}

// Verificar que estamos en la carpeta correcta
if (!fs.existsSync('package.json') || !fs.existsSync('backend') || !fs.existsSync('frontend')) {
  console.error('❌ No estás en la carpeta raíz del proyecto TuTurnoYa');
  console.log('💡 Asegurate de estar en la carpeta que contiene package.json, backend/ y frontend/');
  process.exit(1);
}

console.log('✅ Carpeta correcta detectada\n');

// Paso 1: Limpiar frontend específicamente
console.log('🧹 Limpiando frontend...');
if (fs.existsSync('frontend/node_modules')) {
  console.log('Removiendo frontend/node_modules...');
  try {
    fs.rmSync('frontend/node_modules', { recursive: true, force: true });
  } catch (e) {
    console.log('⚠️  No se pudo remover automáticamente');
  }
}

if (fs.existsSync('frontend/package-lock.json')) {
  try {
    fs.unlinkSync('frontend/package-lock.json');
  } catch (e) {
    console.log('⚠️  No se pudo remover package-lock.json');
  }
}

// Paso 2: Reinstalar frontend con flags especiales
console.log('\n🖥️  Reinstalando frontend...');
if (!runCommand('npm install --legacy-peer-deps --force', 'frontend')) {
  console.log('❌ Falló la instalación del frontend');
  console.log('\n💡 Probá manualmente:');
  console.log('   cd frontend');
  console.log('   npm install --legacy-peer-deps --force');
  process.exit(1);
}

// Paso 3: Verificar que react-scripts está instalado
console.log('\n🔍 Verificando react-scripts...');
if (fs.existsSync('frontend/node_modules/react-scripts')) {
  console.log('✅ react-scripts instalado correctamente');
} else {
  console.log('⚠️  Instalando react-scripts específicamente...');
  runCommand('npm install react-scripts@5.0.1 --legacy-peer-deps', 'frontend');
}

// Paso 4: Verificar backend
console.log('\n📊 Verificando backend...');
if (!fs.existsSync('backend/node_modules')) {
  console.log('🔧 Instalando dependencias del backend...');
  runCommand('npm install', 'backend');
}

console.log('\n✅ ¡Instalación reparada exitosamente!');
console.log('\n🚀 Ahora podés ejecutar:');
console.log('   npm run dev');
console.log('\nO si querés probar solo el frontend:');
console.log('   cd frontend && npm start');
console.log('\n💡 El frontend se abrirá en: http://localhost:3000');
console.log('💡 El backend estará en: http://localhost:5000/api\n');
