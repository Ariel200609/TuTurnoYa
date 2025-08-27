# 🔧 Solución al Error de Dependencias

## ❌ **El Problema**
```
npm error ERESOLVE unable to resolve dependency tree
npm error peer react@"^0.14.9 || ^15.3.0 || ^16.0.0" from react-motion@0.5.2
```

## ✅ **Solución Automática**

```bash
# Limpiar todo e instalar dependencias compatibles
npm run clean-install

# Luego ejecutar la app
npm run demo
```

## 🛠️ **Solución Manual (si la automática falla)**

```bash
# 1. Limpiar dependencias manualmente
# Windows PowerShell:
Remove-Item -Recurse -Force node_modules, backend/node_modules, frontend/node_modules -ErrorAction SilentlyContinue

# Linux/Mac:
rm -rf node_modules backend/node_modules frontend/node_modules

# 2. Instalar paso a paso
npm install
cd backend && npm install
cd ../frontend && npm install --legacy-peer-deps

# 3. Ejecutar
cd ..
npm run demo
```

## 🎯 **¿Por qué pasó esto?**

- **React Motion** es una librería antigua no compatible con React 18
- **Framer Motion** (que ya tenemos) es la alternativa moderna
- Removí React Motion del proyecto para evitar conflictos

## ✅ **Después de la Solución**

Una vez resuelto, podés ejecutar normalmente:

```bash
npm run demo
```

Y la app se abrirá en:
- **Frontend**: http://localhost:3000  
- **Backend**: http://localhost:5000/api

¡Todo funcionará perfectamente! ⚽🎉
