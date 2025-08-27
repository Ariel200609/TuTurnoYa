# ⚡ PRUEBA RÁPIDA - TuTurnoYa

## 🚀 Ejecutar en 2 minutos (SIN configuración)

```bash
# 1. Instalar dependencias
npm run install-deps

# 2. Configurar y ejecutar modo demo
npm run demo
```

**¡Listo!** 🎉 Visitá: http://localhost:3000

## 🎯 ¿Qué podés probar?

### ✅ **Funcionalidades Completas**
- **Página Principal** - Diseño futbolístico con animaciones ⚽
- **Búsqueda de Canchas** - 3 venues de ejemplo en Bahía Blanca 🔍
- **Detalles de Venues** - Información completa con canchas 🏟️
- **Login Demo** - 3 tipos de usuarios sin registración 👥
- **Diseño Responsivo** - Se adapta a móvil y desktop 📱

### 🎮 **Usuarios Demo**
Al abrir la app, elegí tu tipo de usuario:

1. **👤 Usuario** (`user@demo.com`) 
   - Ver página principal
   - Buscar canchas
   - Ver detalles de venues

2. **🏢 Propietario** (`owner@demo.com`)
   - Dashboard de propietario
   - Gestión de venues (placeholder)

3. **👨‍💼 Admin** (`admin@demo.com`)
   - Panel administrativo
   - Gestión de usuarios (placeholder)

### 🏟️ **Datos de Prueba Incluidos**
- **3 Venues** en Bahía Blanca con diferentes características
- **4 Canchas** con distintos precios y tipos
- **Reseñas** y calificaciones de ejemplo
- **Amenities** y servicios variados

## 🎨 **Características del Diseño**

- ✨ **Temática Futbolística** - Colores verdes, iconos de fútbol
- 🌙 **Modo Oscuro/Claro** - Cambia automáticamente
- 🎬 **Animaciones Suaves** - Framer Motion integrado
- 📱 **Responsive** - Mobile-first design
- ⚽ **Micro-interacciones** - Balón girando, efectos hover

## 📱 **Navegación**

### **Páginas Principales**
- `/` - Página de inicio
- `/search` - Búsqueda de canchas
- `/venue/1` - Detalles del venue (3 disponibles: ID 1, 2, 3)

### **Sistemas de Usuario**
- Login automático con selector de tipo
- Navegación adaptativa según usuario
- Sidebar para propietarios/admins

## 🔧 **Modo Demo vs Producción**

### **Modo Demo (Actual)**
- ✅ Sin base de datos requerida
- ✅ Sin Firebase/Twilio/Cloudinary
- ✅ Datos en memoria
- ✅ Login simplificado
- ✅ APIs mock integradas

### **Producción (Configurando .env)**
- ⚙️ PostgreSQL + Sequelize
- ⚙️ SMS real con Twilio
- ⚙️ Subida de imágenes con Cloudinary
- ⚙️ Autenticación completa con Firebase

## 🚨 **¿Algo no funciona?**

```bash
# Reiniciar todo
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install-deps
npm run demo
```

## 💡 **Próximos Pasos**

1. **Explorá el código** - Todo está comentado y estructurado
2. **Agregá funcionalidades** - Sistema de reservas real
3. **Configurá servicios** - Para funcionalidades completas
4. **Desplegá** - Ready para Vercel/Netlify + Heroku

---

⚽ **¡Disfrutá probando TuTurnoYa!** ⚽

_La plataforma de reservas de canchas más futbolera de Argentina_ 🇦🇷
