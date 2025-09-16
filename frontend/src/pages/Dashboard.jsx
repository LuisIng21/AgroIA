import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  BugReport as BugIcon,
  Agriculture as FarmIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();

  const { data: overviewData, isLoading } = useQuery(
    ['dashboard-overview'],
    () => dashboardAPI.getOverview({ period: 30 }),
    {
      select: (response) => response.data,
    }
  );

  const overview = overviewData?.overview || {};

  const statsCards = [
    {
      title: 'Detecciones Totales',
      value: overview.totalDetections || 0,
      icon: <BugIcon />,
      color: 'primary',
      subtitle: 'Últimos 30 días',
    },
    {
      title: 'Detecciones Confirmadas',
      value: overview.detectionStatus?.confirmed || 0,
      icon: <CheckIcon />,
      color: 'success',
      subtitle: `${overview.detectionStatus?.pending || 0} pendientes`,
    },
    {
      title: 'Nivel de Alerta',
      value: getAlertLevel(overview.detectionsBySeverity),
      icon: <WarningIcon />,
      color: getAlertColor(overview.detectionsBySeverity),
      subtitle: 'Basado en severidad',
      isAlert: true,
    },
    {
      title: user?.role === 'farmer' ? 'Mis Fincas' : 'Fincas Activas',
      value: user?.role === 'farmer' ? overview.farms?.userFarms || 0 : overview.farms?.activeFarms || 0,
      icon: <FarmIcon />,
      color: 'info',
      subtitle: user?.role === 'farmer' ? 'Registradas' : 'Con actividad',
    },
  ];

  const recentActivity = [
    {
      title: 'Nueva detección de Roya del Frijol',
      time: 'Hace 2 horas',
      severity: 'high',
      farm: 'Finca San José',
    },
    {
      title: 'Tratamiento aplicado exitosamente',
      time: 'Hace 4 horas',
      severity: 'low',
      farm: 'Finca El Progreso',
    },
    {
      title: 'Alerta meteorológica: Lluvias intensas',
      time: 'Hace 6 horas',
      severity: 'medium',
      farm: 'Región Central',
    },
  ];

  function getAlertLevel(severityData) {
    if (!severityData) return 'Bajo';
    const critical = severityData.critical || 0;
    const high = severityData.high || 0;
    
    if (critical > 0) return 'Crítico';
    if (high > 2) return 'Alto';
    if (high > 0) return 'Medio';
    return 'Bajo';
  }

  function getAlertColor(severityData) {
    const level = getAlertLevel(severityData);
    switch (level) {
      case 'Crítico': return 'error';
      case 'Alto': return 'error';
      case 'Medio': return 'warning';
      default: return 'success';
    }
  }

  function getSeverityColor(severity) {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'success';
    }
  }

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Dashboard
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card>
                <CardContent>
                  <Box sx={{ height: 100 }}>
                    <LinearProgress sx={{ mt: 2 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          ¡Bienvenido, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aquí tienes un resumen de la actividad fitosanitaria de tus cultivos
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${card.color}.main`,
                      mr: 2,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {card.icon}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography color="text.secondary" variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {card.isAlert ? (
                        <Chip
                          label={card.value}
                          color={card.color}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      ) : (
                        card.value
                      )}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {card.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Severity Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Distribución por Severidad
              </Typography>
              {overview.detectionsBySeverity ? (
                Object.entries(overview.detectionsBySeverity).map(([severity, count]) => (
                  <Box key={severity} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {severity === 'critical' ? 'Crítico' : 
                         severity === 'high' ? 'Alto' : 
                         severity === 'medium' ? 'Medio' : 'Bajo'}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {count}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / (overview.totalDetections || 1)) * 100}
                      color={getSeverityColor(severity)}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay datos disponibles
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Actividad Reciente
              </Typography>
              {recentActivity.map((activity, index) => (
                <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < recentActivity.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar
                      sx={{
                        bgcolor: `${getSeverityColor(activity.severity)}.main`,
                        width: 32,
                        height: 32,
                        mr: 2,
                        mt: 0.5,
                      }}
                    >
                      <ScheduleIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {activity.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.farm} • {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Pests */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Plagas Más Comunes (Últimos 30 días)
              </Typography>
              {overview.commonPests && overview.commonPests.length > 0 ? (
                <Grid container spacing={2}>
                  {overview.commonPests.map((pest, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="h4" color="primary.main" sx={{ mb: 1 }}>
                          {pest.detectionCount}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {pest.pestName}
                        </Typography>
                        <Chip
                          label={pest.pestType}
                          size="small"
                          sx={{ mt: 1, textTransform: 'capitalize' }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay detecciones recientes
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;