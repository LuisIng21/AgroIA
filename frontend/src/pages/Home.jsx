import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Agriculture as AgricultureIcon,
  CameraAlt as CameraIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <CameraIcon />,
      title: 'Identificación Inteligente',
      description: 'Analiza imágenes de cultivos usando IA entrenada con el dataset PlantVillage para identificar plagas y enfermedades.',
    },
    {
      icon: <TrendingUpIcon />,
      title: 'Recomendaciones Personalizadas',
      description: 'Recibe tratamientos específicos basados en tu tipo de cultivo, condiciones locales y historial de aplicaciones.',
    },
    {
      icon: <LocationIcon />,
      title: 'Geolocalización Avanzada',
      description: 'Mapea incidencias de plagas, analiza patrones geográficos y recibe alertas zonales para tu región.',
    },
    {
      icon: <SecurityIcon />,
      title: 'Alertas Tempranas',
      description: 'Sistema de notificaciones preventivas basado en condiciones climáticas y patrones de incidencia.',
    },
    {
      icon: <PeopleIcon />,
      title: 'Soporte Técnico',
      description: 'Acceso a técnicos agrícolas especializados y base de conocimiento especializada en frijol nicaragüense.',
    },
    {
      icon: <AgricultureIcon />,
      title: 'Enfoque Local',
      description: 'Diseñado específicamente para las condiciones climáticas y variedades de frijol de Nicaragua.',
    },
  ];

  const userTypes = [
    {
      title: 'Agricultor',
      description: 'Identifica plagas, recibe recomendaciones y gestiona tus cultivos de forma inteligente.',
      features: ['Análisis de imágenes', 'Recomendaciones personalizadas', 'Histórico de cultivos', 'Alertas meteorológicas'],
    },
    {
      title: 'Técnico Agrícola',
      description: 'Monitorea regiones, analiza tendencias y brinda soporte especializado a los agricultores.',
      features: ['Dashboard regional', 'Análisis estadístico', 'Gestión de casos', 'Reportes técnicos'],
    },
    {
      title: 'Administrador',
      description: 'Gestiona el sistema completo y accede a estadísticas globales del control fitosanitario.',
      features: ['Gestión de usuarios', 'Estadísticas globales', 'Configuración del sistema', 'Mantenimiento de datos'],
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.primary.light}40 100%)`,
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                FrijolAI
              </Typography>
              <Typography
                variant="h5"
                component="h2"
                color="text.secondary"
                sx={{ mb: 3, fontWeight: 400 }}
              >
                Sistema Inteligente de Control Fitosanitario para Frijol
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}>
                Revoluciona el manejo de tus cultivos de frijol con inteligencia artificial. 
                Identifica plagas y enfermedades al instante, recibe recomendaciones personalizadas 
                y optimiza tu producción agrícola en Nicaragua.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="large"
                  sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}
                >
                  Comenzar Gratis
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size="large"
                  sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}
                >
                  Iniciar Sesión
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: { xs: 250, md: 400 },
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 150, md: 250 },
                    height: { xs: 150, md: 250 },
                    bgcolor: 'primary.main',
                    fontSize: { xs: '4rem', md: '8rem' },
                    boxShadow: theme.shadows[20],
                  }}
                >
                  🌱
                </Avatar>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          sx={{ mb: 2, fontWeight: 600 }}
        >
          Funcionalidades Principales
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6, fontSize: '1.1rem' }}
        >
          Herramientas avanzadas diseñadas específicamente para el control fitosanitario del frijol
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 60,
                      height: 60,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* User Types Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            Perfiles de Usuario
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6, fontSize: '1.1rem' }}
          >
            Funcionalidades específicas para cada tipo de usuario del sistema
          </Typography>
          <Grid container spacing={4}>
            {userTypes.map((userType, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                      {userType.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {userType.description}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                      Funcionalidades principales:
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      {userType.features.map((feature, featureIndex) => (
                        <Typography
                          component="li"
                          variant="body2"
                          key={featureIndex}
                          sx={{ mb: 0.5, color: 'text.secondary' }}
                        >
                          {feature}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h3" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
          ¿Listo para revolucionar tu agricultura?
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', color: 'text.secondary' }}>
          Únete a FrijolAI y comienza a optimizar tus cultivos con inteligencia artificial
        </Typography>
        <Button
          component={RouterLink}
          to="/register"
          variant="contained"
          size="large"
          sx={{ py: 2, px: 6, fontSize: '1.2rem' }}
        >
          Comenzar Ahora
        </Button>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" textAlign="center">
            © 2024 FrijolAI - Sistema de Control Fitosanitario para Nicaragua
          </Typography>
          <Typography variant="body2" textAlign="center" sx={{ mt: 1, opacity: 0.7 }}>
            Desarrollado con ❤️ para la agricultura nicaragüense
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;