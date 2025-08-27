# 🖥️ Solución: Pantalla Negra "Ruta no encontrada"

## 🔍 **¿Qué Significa Este Error?**

La pantalla negra con `{"error":"Ruta no encontrada"}` significa:

- ✅ **Backend funcionando** (puerto 5000)
- ❌ **Frontend NO arrancó** (debería estar en puerto 3000)  
- 🔄 **Navegador abrió** puerto 5000 en lugar de 3000

## ⚡ **SOLUCIÓN RÁPIDA**

### **Opción 1: Diagnóstico Automático** 
```bash
# Parar todo con Ctrl+C, luego:
npm run test-frontend
```

### **Opción 2: Manual** 
```bash
# 1. Parar con Ctrl+C
# 2. Probar solo el frontend
cd frontend
npm start
```

Si da error, continúa con el **Paso 3**.

### **Paso 3: Arreglar Frontend**
```bash
# Desde frontend/ o volver a raíz:
cd ..
npm run fix-frontend
```

### **Paso 4: Probar Completo**
```bash
npm run demo
```

## 🎯 **URLs Correctas**

- **Frontend (App)**: http://localhost:3000 ← **Esta es la que necesitás**
- **Backend (API)**: http://localhost:5000 ← Esta devuelve JSON

## 🚀 **Resultado Esperado**

Cuando funcione correctamente:
1. Se abren **2 servidores**:
   - `[0] 🚀 Servidor corriendo en puerto 5000 (MODO DEMO)`
   - `[1] webpack compiled successfully`

2. **El navegador se abre automáticamente** en http://localhost:3000

3. **Ves la pantalla de login demo** con 3 opciones de usuario

## 🔧 **Si Sigue Sin Funcionar**

### **Error Común**: `'react-scripts' is not recognized`
```bash
cd frontend
npm install react-scripts@5.0.1 --legacy-peer-deps --force
npm start
```

### **Error de Dependencias**:
```bash
cd frontend  
npm install --legacy-peer-deps --force
cd ..
npm run demo
```

### **Empezar de Cero**:
```bash
npm run clean-install
npm run demo
```

## 💡 **Verificación Final**

Una vez funcionando:
- ✅ Visitás: http://localhost:3000
- ✅ Ves pantalla de login con 3 usuarios demo
- ✅ Elegís "Usuario" para probar
- ✅ Explorás la página principal futbolística

## 🆘 **Si Aún No Funciona**

Ejecutá y reporta la salida de:
```bash
npm run test-frontend
```

¡Este script diagnostica automáticamente el problema y lo soluciona! 🔧⚽
