# 🚀 Despliegue a GitHub Pages - TuTurnoYa

## ⚡ Despliegue Automático (MÁS FÁCIL)

```bash
# Desde la carpeta raíz del proyecto
npm run deploy-github
```

**¡Eso es todo!** El script hace todo automáticamente.

## 🛠️ Despliegue Manual (Paso a Paso)

### **1. Preparar el Repositorio**

1. **Crear repositorio en GitHub** (si no lo tenés):
   - Ve a https://github.com/new
   - Nombre: `tuturno-ya` (o el que prefieras)
   - Público o privado (tu elección)

2. **Subir código**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

### **2. Configurar GitHub Pages**

```bash
# Instalar dependencias del frontend
cd frontend
npm install

# Desplegar a GitHub Pages
npm run deploy
```

### **3. Activar GitHub Pages**

1. **Ve a tu repositorio en GitHub**
2. **Settings** > **Pages**
3. **Source**: Deploy from a branch
4. **Branch**: `gh-pages` / `/ (root)`
5. **Save**

## 🌐 **URLs de Acceso**

Tu aplicación estará disponible en:
- **https://TU_USUARIO.github.io/TU_REPOSITORIO**

Ejemplo: `https://juan123.github.io/tuturno-ya`

## 🎯 **Características en GitHub Pages**

### ✅ **Lo que FUNCIONA:**
- ✅ Página principal con diseño completo
- ✅ Búsqueda de canchas (datos demo)
- ✅ Detalles de venues 
- ✅ Login demo (3 tipos de usuarios)
- ✅ Navegación completa
- ✅ Diseño responsivo
- ✅ Animaciones y efectos

### ⚠️ **Limitaciones:**
- ❌ No hay backend real (solo datos demo)
- ❌ No se pueden hacer reservas reales
- ❌ No hay base de datos
- ❌ No hay envío de SMS/emails

### 🎮 **Modo Demo:**
- **Usuario normal**: `user@demo.com`
- **Propietario**: `owner@demo.com` 
- **Administrador**: `admin@demo.com`

## 🔄 **Actualizar el Sitio**

```bash
# Cada vez que hagas cambios:
npm run deploy-github
```

## 🛠️ **Personalización**

### **Cambiar la URL base:**
En `frontend/package.json`:
```json
"homepage": "https://TU_USUARIO.github.io/TU_REPOSITORIO"
```

### **Agregar tu dominio personalizado:**
1. Crear archivo `frontend/public/CNAME`:
   ```
   tudominio.com
   ```
2. Configurar DNS de tu dominio
3. Redeplegar: `npm run deploy-github`

## 🚨 **Solución de Problemas**

### **Error: "gh-pages not found"**
```bash
cd frontend
npm install gh-pages --save-dev
```

### **Error: "Permission denied"**
```bash
git remote set-url origin https://TOKEN@github.com/USUARIO/REPO.git
```

### **Páginas en blanco**
- Verificar que `homepage` esté configurado correctamente
- Usar `HashRouter` (ya está configurado)

## 📱 **Para Mostrar tu Proyecto**

### **Demo en Vivo:**
- Compartí la URL: `https://TU_USUARIO.github.io/TU_REPOSITORIO`
- Funciona en móvil y desktop
- Todos los diseños y animaciones visibles

### **Código:**
- GitHub: `https://github.com/TU_USUARIO/TU_REPOSITORIO`
- Mostrá la estructura del proyecto
- Backend completo (aunque no corra en GitHub Pages)

### **Características Destacadas:**
- 🎨 Diseño moderno multi-deporte
- 📱 Responsive design
- ⚡ React con Context API
- 🗄️ Backend completo con PostgreSQL
- 🔐 Sistema de autenticación multi-nivel
- 📊 Dashboard administrativo
- 🎯 Arquitectura escalable

¡Listo para impresionar! 🎉
