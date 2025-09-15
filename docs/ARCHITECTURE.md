# Arquitectura del Sistema FrijolAI

## Visión General

FrijolAI es un sistema completo de control fitosanitario diseñado específicamente para el cultivo de frijol en Nicaragua. El sistema utiliza una arquitectura moderna de microservicios con las siguientes características:

## Stack Tecnológico

### Frontend
- **React 18**: Framework de interfaz de usuario
- **Material-UI (MUI)**: Biblioteca de componentes UI
- **React Query**: Gestión de estado del servidor
- **React Router**: Navegación
- **Leaflet**: Mapas interactivos
- **Recharts**: Visualización de datos

### Backend
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web
- **PostgreSQL**: Base de datos principal
- **PostGIS**: Extensión geoespacial
- **Sequelize**: ORM
- **JWT**: Autenticación
- **Multer**: Manejo de archivos

### Inteligencia Artificial
- **Python**: Lenguaje principal
- **PyTorch**: Framework de IA
- **FastAPI**: API de servicios de IA
- **OpenCV**: Procesamiento de imágenes
- **PlantVillage Dataset**: Datos de entrenamiento

### Infraestructura
- **Docker**: Contenedores
- **Docker Compose**: Orquestación
- **Redis**: Cache y sesiones
- **Nginx**: Proxy reverso (producción)

## Arquitectura de Componentes

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   AI Service    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Python)      │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        │
                    ┌─────────────────┐                │
                    │   PostgreSQL    │                │
                    │   + PostGIS     │                │
                    │   Port: 5432    │                │
                    └─────────────────┘                │
                              │                        │
                              ▼                        ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │     Redis       │    │   File Storage  │
                    │   Port: 6379    │    │   (Uploads)     │
                    └─────────────────┘    └─────────────────┘
```

## Flujo de Datos

### 1. Identificación de Plagas
```
Usuario sube imagen → Frontend → Backend API → AI Service → Procesamiento → 
Resultados → Base de Datos → Dashboard
```

### 2. Recomendaciones Personalizadas
```
Detección confirmada → Motor de recomendaciones → Factores contextuales →
Histórico del usuario → Recomendaciones personalizadas
```

### 3. Geolocalización y Mapeo
```
Coordenadas de finca → PostGIS → Análisis espacial → Mapas de incidencia →
Alertas zonales
```

## Patrones de Diseño

### Backend
- **Controlador-Servicio-Repositorio**: Separación de responsabilidades
- **Middleware**: Autenticación, validación, logging
- **Factory Pattern**: Creación de modelos
- **Observer Pattern**: Notificaciones y alertas

### Frontend
- **Context Pattern**: Gestión de estado global
- **Hook Pattern**: Lógica reutilizable
- **Component Composition**: Componentes modulares
- **Provider Pattern**: Inyección de dependencias

### Base de Datos
- **Soft Delete**: Eliminación lógica
- **Audit Trail**: Seguimiento de cambios
- **Spatial Indexing**: Consultas geoespaciales optimizadas

## Seguridad

### Autenticación y Autorización
- JWT tokens con expiración configurable
- Roles granulares: farmer, technician, admin
- Middleware de autorización por ruta
- Encriptación de contraseñas con bcrypt

### Protección de Datos
- Validación de entrada con Joi
- Sanitización de datos
- Rate limiting
- CORS configurado
- Headers de seguridad con Helmet

### Geolocalización
- Precisión controlada por rol
- Anonimización de datos sensibles
- Acceso restringido a información de ubicación

## Escalabilidad

### Horizontal
- Microservicios independientes
- Load balancing con Nginx
- Réplicas de contenedores Docker
- Cache distribuido con Redis

### Vertical
- Optimización de consultas SQL
- Índices espaciales para geolocalización
- Compresión de imágenes
- Lazy loading en frontend

## Monitoreo y Logging

### Backend Logging
- Winston para logging estructurado
- Niveles: error, warn, info, debug
- Rotación de logs
- Métricas de performance

### Métricas del Sistema
- Tiempo de respuesta de APIs
- Uso de memoria y CPU
- Precisión del modelo de IA
- Actividad de usuarios

## Integración con Servicios Externos

### APIs de Clima
- OpenWeatherMap API
- Datos meteorológicos en tiempo real
- Alertas climáticas automatizadas

### Servicios de Mapas
- Leaflet con OpenStreetMap
- Tiles personalizados para Nicaragua
- Geocoding y reverse geocoding

### Notificaciones
- Email con Nodemailer
- SMS (integración futura)
- Push notifications para PWA

## Buenas Prácticas Implementadas

### Desarrollo
- Código modular y reutilizable
- Separación de concerns
- Principios SOLID
- Testing automatizado
- Documentación de código

### DevOps
- Dockerización completa
- Environment variables
- CI/CD pipeline ready
- Health checks
- Graceful shutdown

### UX/UI
- Diseño responsive
- Offline support básico
- Progressive Web App features
- Accesibilidad (WCAG guidelines)
- Internacionalización (i18n ready)

## Casos de Uso Principales

### Agricultor
1. **Identificación de Plagas**
   - Captura imagen con móvil
   - Análisis automático con IA
   - Resultados inmediatos

2. **Recomendaciones**
   - Basadas en detección
   - Personalizadas por finca
   - Consideran historial

3. **Gestión de Fincas**
   - Registro de ubicaciones
   - Seguimiento de cultivos
   - Histórico de tratamientos

### Técnico Agrícola
1. **Monitoreo Regional**
   - Vista de múltiples fincas
   - Análisis de tendencias
   - Alertas de incidencia

2. **Soporte a Agricultores**
   - Revisión de detecciones
   - Validación de diagnósticos
   - Recomendaciones especializadas

### Administrador
1. **Gestión del Sistema**
   - Usuarios y permisos
   - Configuración de parámetros
   - Mantenimiento de datos

2. **Análisis Global**
   - Estadísticas del sistema
   - Tendencias nacionales
   - Reportes ejecutivos

## Consideraciones Especiales para Nicaragua

### Contexto Local
- Variedades de frijol locales
- Condiciones climáticas específicas
- Prácticas agrícolas tradicionales
- Recursos económicos limitados

### Adaptaciones Técnicas
- Funcionalidad offline básica
- Interfaz en español
- Unidades de medida locales
- Moneda local (Córdoba)

### Sostenibilidad
- Enfoque en agricultura sostenible
- Promoción de control biológico
- Reducción de pesticidas químicos
- Educación agrícola integrada

Esta arquitectura está diseñada para ser escalable, mantenible y adaptable a las necesidades específicas del sector agrícola nicaragüense.