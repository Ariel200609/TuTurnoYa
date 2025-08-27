#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Arreglando error específico de ajv...\n');

function runCommand(command, options = {}) {
  try {
    console.log(`📋 ${command}`);
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    console.error(`❌ Error: ${command}`);
    return false;
  }
}

// Verificar ubicación
if (!fs.existsSync('frontend/package.json')) {
  console.error('❌ Ejecutá desde la carpeta raíz del proyecto (que contiene frontend/)');
  process.exit(1);
}

console.log('🎯 Error detectado: ajv/dist/compile/codegen');
console.log('🔧 Aplicando solución específica...\n');

// Cambiar a frontend
process.chdir('frontend');

console.log('🗑️  Limpiando dependencias problemáticas...');
// Eliminar node_modules y locks
if (fs.existsSync('node_modules')) {
  try {
    fs.rmSync('node_modules', { recursive: true, force: true });
    console.log('✅ node_modules eliminado');
  } catch (e) {
    console.log('⚠️  No se pudo eliminar node_modules automáticamente');
  }
}

['package-lock.json', 'yarn.lock'].forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`✅ ${file} eliminado`);
    } catch (e) {}
  }
});

console.log('\n🔧 Instalando con versiones compatibles específicas...');

// Secuencia específica para resolver el conflicto ajv
const commands = [
  // Instalar versiones específicas compatibles
  'npm install ajv@6.12.6',
  'npm install ajv-keywords@3.5.2', 
  'npm install schema-utils@2.7.1',
  
  // Instalar React con versiones específicas
  'npm install react@18.2.0 react-dom@18.2.0',
  'npm install react-scripts@5.0.1',
  
  // Instalar el resto con flags de compatibilidad
  'npm install --legacy-peer-deps --force'
];

let success = true;
for (const cmd of commands) {
  console.log(`\n🔧 ${cmd}`);
  if (!runCommand(cmd)) {
    console.log(`⚠️  Falló: ${cmd}`);
    success = false;
    break;
  }
  console.log('✅ OK');
}

if (success) {
  console.log('\n🎯 Verificando solución...');
  if (fs.existsSync('node_modules/ajv/dist/compile/codegen')) {
    console.log('✅ ajv/dist/compile/codegen ahora existe');
  }
  
  if (fs.existsSync('node_modules/react-scripts')) {
    console.log('✅ react-scripts OK');
  }
  
  console.log('\n🚀 ¡Error de ajv solucionado!');
  console.log('💡 Ahora ejecutá desde la raíz del proyecto:');
  console.log('   cd ..');
  console.log('   npm run demo');
  console.log('\n⚡ O para probar solo el frontend:');
  console.log('   npm start (desde esta carpeta frontend)');
  
} else {
  console.log('\n❌ Algo falló en la instalación');
  console.log('🔧 Probá la solución manual:');
  console.log('   npm install ajv@6.12.6 ajv-keywords@3.5.2 --force');
  console.log('   npm install react-scripts@5.0.1 --legacy-peer-deps');
  console.log('   npm install --legacy-peer-deps --force');
}

console.log('\n💡 Una vez solucionado, visitá: http://localhost:3000');
