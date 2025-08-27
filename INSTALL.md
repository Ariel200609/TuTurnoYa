# 🚀 Guía de Instalación - TuTurnoYa

## ⚡ Instalación Rápida

### 1. Instalar Dependencias
```bash
# Desde la raíz del proyecto
npm run install-deps
```

### 2. Configurar Base de Datos PostgreSQL
```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Crear usuario y base de datos
sudo -u postgres psql
CREATE USER tuturno_user WITH PASSWORD 'tu_password';
CREATE DATABASE tuturno_ya OWNER tuturno_user;
GRANT ALL PRIVILEGES ON DATABASE tuturno_ya TO tuturno_user;
\q
```

### 3. Configurar Variables de Entorno

Crear `backend/.env`:
```env
DATABASE_URL=postgresql://tuturno_user:tu_password@localhost:5432/tuturno_ya
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tuturno_ya
DB_USER=tuturno_user
DB_PASS=tu_password

NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

JWT_SECRET=mi_super_secret_jwt_key_muy_segura_2024
JWT_EXPIRE=7d

# Para desarrollo - valores de prueba
TWILIO_ACCOUNT_SID=test_account_sid
TWILIO_AUTH_TOKEN=test_auth_token
TWILIO_PHONE_NUMBER=+5492911234567

CLOUDINARY_CLOUD_NAME=test_cloud
CLOUDINARY_API_KEY=test_key
CLOUDINARY_API_SECRET=test_secret

DEFAULT_COMMISSION_RATE=0.10
```

Crear `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Inicializar Base de Datos
```bash
cd backend
npx sequelize-cli db:migrate
```

### 5. Ejecutar la Aplicación
```bash
# Desde la raíz del proyecto
npm run dev
```

¡Listo! La aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## 🔧 Configuración de Servicios Externos (Producción)

### Firebase Authentication
1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear nuevo proyecto
3. Habilitar Authentication > Phone
4. Descargar service account JSON
5. Extraer credenciales para `.env`

### Twilio SMS
1. Registrarse en [Twilio](https://www.twilio.com/)
2. Obtener Account SID, Auth Token y Phone Number
3. Configurar en `.env`

### Cloudinary (Imágenes)
1. Registrarse en [Cloudinary](https://cloudinary.com/)
2. Obtener Cloud Name, API Key y API Secret
3. Configurar en `.env`

## 🐳 Instalación con Docker (Opcional)

```bash
# Crear contenedores
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## 🧪 Datos de Prueba

Para poblar la base de datos con datos de ejemplo:

```bash
cd backend
npx sequelize-cli db:seed:all
```

Esto creará:
- Usuario admin: `admin@tuturno-ya.com` / `admin123`
- Venues de ejemplo en Bahía Blanca
- Canchas con diferentes precios
- Reservas de muestra

## ✅ Verificar Instalación

### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

### Frontend
Abrir http://localhost:3000 y verificar que carga la página principal.

## 🚨 Solución de Problemas

### Error de Conexión a PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Puerto en Uso
```bash
# Cambiar puertos en package.json si es necesario
# Backend: PORT=5001
# Frontend: PORT=3001
```

### Dependencias Faltantes
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
cd backend && rm -rf node_modules package-lock.json
cd ../frontend && rm -rf node_modules package-lock.json
cd ..
npm run install-deps
```

## 🎯 Próximos Pasos

1. **Registrar tu primer venue**: Ir a http://localhost:3000/venue-owner/register
2. **Crear usuario**: Usar el sistema de SMS de prueba
3. **Explorar admin**: Acceder con credenciales de admin seed
4. **Personalizar**: Modificar colores, logo y textos en el código

¡Ya tenés tu plataforma de reservas funcionando! ⚽
