# 🏟️ TuTurnoYa - Plataforma de Reservas Deportivas

Una plataforma completa de reservas de canchas deportivas estilo marketplace, desarrollada con React, Node.js y PostgreSQL. Soporta múltiples deportes: fútbol, tenis, básquet, vóley y más.

## 🚀 Características Principales

### 📱 **Demo en Vivo**
**Visitá:** [https://TU_USUARIO.github.io/TU_REPOSITORIO](https://github.com/pages) *(Reemplazá con tu URL real)*

### Para Usuarios (Jugadores)
- 📱 Registro/Login con verificación por SMS
- 🔍 Búsqueda avanzada de canchas por ubicación, precio, tipo de piso
- ⚡ Reservas en segundos
- 📅 Historial de reservas
- 🔔 Notificaciones automáticas (recordatorios, cancelaciones)
- ⭐ Sistema de reseñas y calificaciones

### Para Propietarios de Canchas
- 🏢 Panel de administración completo
- 💰 Configuración de precios y horarios
- ✅ Confirmación/rechazo de reservas
- 📊 Estadísticas de ocupación y ingresos
- 💳 Integración de pagos online (opcional)

### Para Administradores
- 📈 Dashboard con métricas generales
- 👥 Gestión de usuarios y propietarios
- 🏟️ Control y verificación de venues
- 💼 Gestión de comisiones
- 📋 Reportes detallados

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de UI
- **React Router** - Enrutamiento
- **Styled Components** - Estilos dinámicos
- **Framer Motion** - Animaciones suaves
- **React Query** - Gestión de estado del servidor
- **React Hook Form** - Manejo de formularios
- **Leaflet** - Mapas interactivos
- **Firebase Auth** - Autenticación
- **Axios** - Cliente HTTP

### Backend
- **Node.js** - Runtime de servidor
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos principal
- **Sequelize** - ORM
- **Firebase Admin** - Autenticación del servidor
- **Twilio** - Envío de SMS
- **Cloudinary** - Almacenamiento de imágenes
- **JWT** - Tokens de autenticación

### Características Adicionales
- 🎨 **Diseño Responsivo** - Optimizado para todos los dispositivos
- 🌙 **Modo Oscuro** - Tema nocturno para partidos nocturnos
- ⚽ **Temática Futbolística** - Diseño inspirado en el deporte
- 🔐 **Seguridad Avanzada** - Rate limiting, validación, sanitización
- 📱 **PWA Ready** - Preparado para aplicación móvil

## 🏗️ Arquitectura del Sistema

```
TuTurnoYa/
├── 📁 backend/                 # API REST con Node.js
│   ├── 📁 config/             # Configuración de BD
│   ├── 📁 middleware/         # Middlewares personalizados
│   ├── 📁 models/            # Modelos de Sequelize
│   ├── 📁 routes/            # Rutas de la API
│   └── server.js             # Servidor principal
├── 📁 frontend/              # Aplicación React
│   ├── 📁 src/
│   │   ├── 📁 components/    # Componentes reutilizables
│   │   ├── 📁 contexts/      # Context API (Auth, Theme)
│   │   ├── 📁 pages/        # Páginas principales
│   │   ├── 📁 services/     # Servicios API
│   │   └── 📁 styles/       # Estilos globales
│   └── public/              # Archivos estáticos
└── package.json             # Scripts de desarrollo
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 16+ y npm
- PostgreSQL 12+
- Cuenta de Firebase (para autenticación)
- Cuenta de Twilio (para SMS)
- Cuenta de Cloudinary (para imágenes)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/tuturno-ya.git
cd tuturno-ya
```

### 2. Instalar Dependencias
```bash
# Instalar todas las dependencias
npm run install-deps

# O instalar manualmente
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configurar Variables de Entorno

#### Backend (.env)
```env
# Base de Datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/tuturno_ya
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tuturno_ya
DB_USER=usuario
DB_PASS=password

# Servidor
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRE=7d

# Firebase
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu_clave_privada\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com

# Twilio SMS
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Configuración de Comisiones
DEFAULT_COMMISSION_RATE=0.10
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=tu_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu-proyecto-firebase
```

### 4. Configurar Base de Datos
```bash
# Crear base de datos PostgreSQL
createdb tuturno_ya

# Ejecutar migraciones (desde /backend)
cd backend
npm run migrate

# Ejecutar seeders (opcional)
npm run seed
```

### 5. Ejecutar la Aplicación
```bash
# Ejecutar backend y frontend simultáneamente
npm run dev

# O ejecutar por separado
npm run server  # Backend en puerto 5000
npm run client  # Frontend en puerto 3000
```

## 📊 Modelo de Datos

### Entidades Principales
- **Users** - Usuarios/jugadores
- **VenueOwners** - Propietarios de canchas
- **Venues** - Complejos deportivos
- **Courts** - Canchas individuales
- **Bookings** - Reservas
- **Reviews** - Reseñas y calificaciones
- **Notifications** - Sistema de notificaciones

### Relaciones
- Un **VenueOwner** puede tener múltiples **Venues**
- Un **Venue** puede tener múltiples **Courts**
- Un **User** puede hacer múltiples **Bookings**
- Un **Booking** pertenece a un **Court** y un **User**
- Los **Reviews** conectan **Users**, **Venues** y **Bookings**

## 🎯 Casos de Uso Principales

### 1. Reserva de Cancha (Usuario)
1. Usuario busca canchas disponibles
2. Selecciona fecha, horario y duración
3. Confirma la reserva con sus datos
4. Recibe confirmación por SMS/notificación
5. El venue confirma o rechaza la reserva
6. Usuario recibe recordatorio 24hs antes

### 2. Gestión de Reservas (Propietario)
1. Propietario ve reservas pendientes en dashboard
2. Revisa detalles de la reserva
3. Confirma o rechaza según disponibilidad
4. Hace check-in del usuario el día del partido
5. Marca como completada al finalizar

### 3. Administración de Venues (Admin)
1. Admin revisa venues pendientes de verificación
2. Verifica documentación y datos
3. Aprueba o rechaza el venue
4. Monitorea estadísticas generales
5. Gestiona comisiones y pagos

## 📈 Modelo de Negocio

- **Gratuito** para usuarios finales
- **Comisión del 5-10%** por reserva completada
- **Inicio sin pagos online** (agenda digital)
- **Escalabilidad** a otras ciudades
- **Servicios premium** para propietarios (estadísticas avanzadas, promociones, etc.)

## 🌟 Características Técnicas Destacadas

### Autenticación Multi-Nivel
- **SMS/WhatsApp** para usuarios (más conveniente)
- **Email/Password** para propietarios y admins
- **JWT** con refresh tokens
- **Rate limiting** para seguridad

### Sistema de Notificaciones
- **En tiempo real** vía WebSocket
- **SMS** para eventos críticos
- **Email** para reportes
- **Push notifications** (preparado para PWA)

### Gestión de Estado Avanzada
- **React Query** para cache y sincronización
- **Context API** para estado global
- **Optimistic updates** para mejor UX

### Animaciones y UX
- **Framer Motion** para transiciones fluidas
- **Temática futbolística** consistente
- **Micro-interacciones** que mejoran la experiencia
- **Loading states** informativos

## 🚀 Roadmap

### Fase 1 - MVP (Actual)
- ✅ Sistema de usuarios y autenticación
- ✅ Gestión básica de venues y canchas
- ✅ Sistema de reservas
- ✅ Notificaciones básicas
- ✅ Panel de administración

### Fase 2 - Mejoras
- 🔲 Integración de pagos (Mercado Pago/Stripe)
- 🔲 Sistema de reviews mejorado
- 🔲 Chat entre usuarios y propietarios
- 🔲 Integración con redes sociales
- 🔲 API pública para terceros

### Fase 3 - Expansión
- 🔲 App móvil nativa (React Native)
- 🔲 Expansión a otras ciudades
- 🔲 Sistema de torneos
- 🔲 Marketplace de productos deportivos
- 🔲 Integración con streaming de partidos

## 🤝 Contribuir

1. Fork del repositorio
2. Crear branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 👨‍💻 Equipo de Desarrollo

- **Frontend**: React, Styled Components, Framer Motion
- **Backend**: Node.js, Express, PostgreSQL
- **DevOps**: Docker, CI/CD, Cloud deployment
- **Mobile**: React Native (próximamente)

## 📞 Contacto

- **Email**: info@tuturno-ya.com
- **Website**: https://tuturno-ya.com
- **LinkedIn**: [TuTurnoYa](https://linkedin.com/company/tuturno-ya)

---

⚽ **¡Hacé tu reserva y jugá como un campeón!** ⚽
