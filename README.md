# FrijolAI - Sistema de Control Fitosanitario para Frijol

FrijolAI es un sistema inteligente de control fitosanitario especializado en el cultivo de frijol en Nicaragua. Utiliza inteligencia artificial para la identificación de plagas y enfermedades, proporcionando recomendaciones personalizadas para el manejo integrado de cultivos.

## 🌱 Características Principales

- **Identificación Inteligente de Plagas**: Análisis de imágenes usando IA entrenada con el dataset PlantVillage
- **Recomendaciones Personalizadas**: Sistema de recomendaciones basado en condiciones específicas del cultivo
- **Geolocalización**: Mapeo de incidencias y análisis geoespacial
- **Gestión de Usuarios**: Perfiles diferenciados para agricultores, técnicos y administradores
- **Dashboards Estadísticos**: Análisis de tendencias y reportes detallados
- **Alertas Tempranas**: Sistema de notificaciones preventivas

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: React 18 + Material-UI + Leaflet (mapas)
- **Backend**: Node.js + Express + Sequelize ORM
- **Base de Datos**: PostgreSQL + PostGIS (para datos geoespaciales)
- **IA**: Integración con modelo PyTorch (PlantVillage dataset)
- **Autenticación**: JWT + bcrypt
- **Deployment**: Docker + Docker Compose

### Estructura del Proyecto
```
FrijolAI/
├── backend/          # API Node.js
├── frontend/         # React App
├── ai-service/       # Servicio de IA (PyTorch)
├── database/         # Scripts y migraciones
├── docs/            # Documentación
└── docker/          # Configuración Docker
```

## 🚀 Inicio Rápido

```bash
# Clonar repositorio
git clone https://github.com/LuisIng21/AgroIA.git
cd AgroIA

# Instalar dependencias
npm install

# Configurar base de datos
docker-compose up -d postgres

# Ejecutar migraciones
npm run migrate

# Iniciar desarrollo
npm run dev
```

## 👥 Perfiles de Usuario

1. **Agricultor**: Identificación de plagas, recomendaciones, alertas
2. **Técnico Agrícola**: Análisis avanzado, reportes, gestión de casos
3. **Administrador**: Gestión completa del sistema, estadísticas globales

## 📊 Funcionalidades por Perfil

### Agricultor
- Captura y análisis de imágenes
- Recomendaciones de tratamiento
- Histórico de cultivos
- Alertas meteorológicas

### Técnico Agrícola
- Dashboard de monitoreo regional
- Análisis estadístico avanzado
- Gestión de casos complejos
- Reportes técnicos

### Administrador
- Gestión de usuarios y permisos
- Estadísticas del sistema
- Configuración de parámetros
- Mantenimiento de datos

## 🗺️ Geolocalización

El sistema incluye funcionalidades de mapeo para:
- Registro de ubicaciones de cultivos
- Análisis de distribución de plagas
- Alertas zonales
- Planificación territorial

## 📈 Dashboard Estadístico

- Tendencias de incidencia de plagas
- Efectividad de tratamientos
- Análisis temporal y espacial
- Reportes de impacto económico

## 🤖 Integración de IA

El modelo de IA está entrenado con el dataset PlantVillage y puede identificar:
- Enfermedades foliares del frijol
- Plagas comunes
- Deficiencias nutricionales
- Problemas ambientales

## 🔒 Seguridad

- Autenticación JWT
- Encriptación de datos sensibles
- Control de acceso basado en roles
- Auditoría de acciones

## 📱 Compatibilidad

- Responsive design para móviles y tablets
- Soporte offline básico
- PWA (Progressive Web App)

## 🌍 Enfoque Nicaragua

El sistema está especialmente adaptado para:
- Condiciones climáticas de Nicaragua
- Variedades locales de frijol
- Plagas específicas de la región
- Prácticas agrícolas tradicionales

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@frijolai.ni
- Teléfono: +505 xxxx-xxxx
- WhatsApp: +505 xxxx-xxxx

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.
