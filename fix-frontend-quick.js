#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Arreglo RÁPIDO del Frontend...\n');

// Función para ejecutar comandos
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

// Verificar ubicación
if (!fs.existsSync('frontend/package.json')) {
  console.error('❌ No se encuentra frontend/package.json');
  console.log('💡 Asegurate de estar en la carpeta raíz del proyecto');
  process.exit(1);
}

console.log('✅ Ubicación correcta detectada\n');

// Cambiar al directorio frontend
process.chdir('frontend');

console.log('🧹 Limpiando frontend...');
// Eliminar node_modules si existe
if (fs.existsSync('node_modules')) {
  try {
    fs.rmSync('node_modules', { recursive: true, force: true });
    console.log('✅ node_modules eliminado');
  } catch (e) {
    console.log('⚠️  No se pudo eliminar node_modules automáticamente');
  }
}

// Eliminar archivos de lock
['package-lock.json', 'yarn.lock'].forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`✅ ${file} eliminado`);
    } catch (e) {
      console.log(`⚠️  No se pudo eliminar ${file}`);
    }
  }
});

console.log('\n🚀 Instalando con versiones específicas...');

// Instalar con versiones específicas que funcionan
const commands = [
  'npm install react@18.2.0 react-dom@18.2.0',
  'npm install react-scripts@5.0.1 --legacy-peer-deps', 
  'npm install --legacy-peer-deps --force'
];

for (const cmd of commands) {
  if (!runCommand(cmd)) {
    console.log(`⚠️  Falló: ${cmd}`);
    break;
  }
  console.log('✅ Paso completado\n');
}

// Verificar instalación
if (fs.existsSync('node_modules/react-scripts')) {
  console.log('✅ ¡Frontend arreglado correctamente!');
  console.log('\n🚀 Ahora podés ejecutar desde la raíz del proyecto:');
  console.log('   npm run demo');
} else {
  console.log('❌ Algo falló. Probá manualmente:');
  console.log('   cd frontend');  
  console.log('   npm install --legacy-peer-deps --force');
}

console.log('\n💡 Una vez arreglado, visitá: http://localhost:3000');
