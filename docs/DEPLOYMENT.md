# Guía de Instalación y Deployment - FrijolAI

## Instalación Local con Docker

### Prerrequisitos
- Docker 20.0+
- Docker Compose 2.0+
- Git
- 4GB RAM mínimo
- 10GB espacio libre en disco

### Instalación Rápida

1. **Clonar el repositorio**
```bash
git clone https://github.com/LuisIng21/AgroIA.git
cd AgroIA
```

2. **Configurar variables de entorno**
```bash
cp backend/.env.example backend/.env
# Editar backend/.env con tus configuraciones
```

3. **Iniciar todos los servicios**
```bash
docker-compose up -d
```

4. **Verificar que todos los servicios están corriendo**
```bash
docker-compose ps
```

5. **Acceder a la aplicación**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- AI Service: http://localhost:8000
- Base de datos: localhost:5432

### Configuración Detallada

#### Variables de Entorno Importantes

**Backend (.env)**
```env
NODE_ENV=development
DB_HOST=postgres
DB_PORT=5432
DB_NAME=frijolai_db
DB_USER=frijolai_user
DB_PASSWORD=frijolai_password
JWT_SECRET=your_secure_jwt_secret_here
FRONTEND_URL=http://localhost:3000
```

**Frontend**
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

#### Inicialización de la Base de Datos

1. **Ejecutar migraciones**
```bash
docker-compose exec backend npm run migrate
```

2. **Cargar datos semilla (opcional)**
```bash
docker-compose exec backend npm run seed
```

## Instalación Manual (Sin Docker)

### Prerrequisitos
- Node.js 18+
- Python 3.9+
- PostgreSQL 15+ con PostGIS
- Redis 7+

### Backend

1. **Instalar dependencias**
```bash
cd backend
npm install
```

2. **Configurar base de datos PostgreSQL**
```sql
CREATE DATABASE frijolai_db;
CREATE USER frijolai_user WITH PASSWORD 'frijolai_password';
GRANT ALL PRIVILEGES ON DATABASE frijolai_db TO frijolai_user;
```

3. **Habilitar PostGIS**
```sql
\c frijolai_db;
CREATE EXTENSION postgis;
```

4. **Ejecutar migraciones**
```bash
npm run migrate
```

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

### Frontend

1. **Instalar dependencias**
```bash
cd frontend
npm install
```

2. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

### AI Service

1. **Crear entorno virtual**
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows
```

2. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

3. **Iniciar servicio**
```bash
python app.py
```

## Deployment en Producción

### Usando Docker Compose (Recomendado)

1. **Crear archivo docker-compose.prod.yml**
```yaml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      VITE_API_BASE_URL: https://yourdomain.com/api

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      PORT: 3001
    volumes:
      - ./uploads:/app/uploads

  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: frijolai_db
      POSTGRES_USER: frijolai_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

2. **Configurar Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. **Deploy**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### En Servidor Cloud (AWS/DigitalOcean/Azure)

#### 1. Preparar Servidor
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Configurar SSL con Let's Encrypt
```bash
# Instalar Certbot
sudo apt install certbot

# Obtener certificado
sudo certbot certonly --standalone -d yourdomain.com

# Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 3. Configuración de Seguridad
```bash
# Firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Usuarios y permisos
sudo adduser deploy
sudo usermod -aG docker deploy
sudo usermod -aG sudo deploy
```

### Variables de Entorno para Producción

**Críticas para Seguridad:**
```env
JWT_SECRET=your_very_secure_random_string_here
DB_PASSWORD=your_secure_database_password
SMTP_PASS=your_email_app_password
```

**Performance:**
```env
NODE_ENV=production
REDIS_URL=redis://redis:6379
LOG_LEVEL=warn
```

**Integraciones:**
```env
WEATHER_API_KEY=your_openweathermap_key
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## Monitoreo y Mantenimiento

### Health Checks

**Backend Health Check:**
```bash
curl http://localhost:3001/health
```

**AI Service Health Check:**
```bash
curl http://localhost:8000/
```

### Logs

**Ver logs en tiempo real:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ai-service
```

**Logs específicos:**
```bash
docker-compose logs --tail=100 backend
```

### Backups

**Base de Datos:**
```bash
# Backup
docker-compose exec postgres pg_dump -U frijolai_user frijolai_db > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T postgres psql -U frijolai_user frijolai_db < backup_20241215.sql
```

**Archivos:**
```bash
# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/

# Backup completo
docker run --rm -v frijolai_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres_backup_$(date +%Y%m%d).tar.gz /data
```

### Actualizaciones

**Actualizar servicios:**
```bash
git pull origin main
docker-compose pull
docker-compose up -d --build
```

**Migrar base de datos:**
```bash
docker-compose exec backend npm run migrate
```

## Troubleshooting

### Problemas Comunes

**Puerto ya en uso:**
```bash
sudo lsof -i :3000
sudo kill -9 PID
```

**Problemas de permisos:**
```bash
sudo chown -R $USER:$USER ./backend/uploads
sudo chmod -R 755 ./backend/uploads
```

**Base de datos no conecta:**
```bash
docker-compose logs postgres
docker-compose exec postgres psql -U frijolai_user -d frijolai_db -c "SELECT version();"
```

**AI Service no responde:**
```bash
docker-compose logs ai-service
docker-compose exec ai-service python -c "import torch; print(torch.__version__)"
```

### Performance

**Optimizaciones de Base de Datos:**
```sql
-- Índices para geolocalización
CREATE INDEX idx_farms_location ON farms USING GIST (location);
CREATE INDEX idx_detections_created_at ON detections (created_at);
CREATE INDEX idx_users_role ON users (role);
```

**Optimizaciones de Frontend:**
- Lazy loading de componentes
- Code splitting
- Compresión de imágenes
- Service workers para cache

## Seguridad en Producción

### Checklist de Seguridad

- [ ] Cambiar todas las contraseñas por defecto
- [ ] Configurar SSL/TLS
- [ ] Habilitar firewall
- [ ] Configurar backup automático
- [ ] Monitoreo de logs
- [ ] Rate limiting
- [ ] Validación de entrada
- [ ] Headers de seguridad
- [ ] Actualizar dependencias regularmente

### Configuración de Rate Limiting
```javascript
// En backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite por IP
});

app.use('/api', limiter);
```

## Soporte

Para problemas técnicos:
- Revisar logs del servicio correspondiente
- Verificar configuración de variables de entorno
- Consultar documentación de APIs
- Contactar al equipo de desarrollo

**Logs importantes:**
- Backend: `backend/logs/`
- Nginx: `/var/log/nginx/`
- Sistema: `journalctl -u docker`