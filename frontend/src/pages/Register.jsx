import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Agriculture as AgricultureIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await registerUser(data);
      if (result.success) {
        toast.success('¡Registro exitoso! Bienvenido a FrijolAI');
        navigate('/dashboard');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Error inesperado. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar
            sx={{
              m: 1,
              bgcolor: 'primary.main',
              width: 60,
              height: 60,
            }}
          >
            <AgricultureIcon sx={{ fontSize: 30 }} />
          </Avatar>
          <Typography component="h1" variant="h4" color="primary" sx={{ mb: 1 }}>
            Únete a FrijolAI
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Crea tu cuenta y comienza a optimizar tus cultivos
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  label="Nombre"
                  name="firstName"
                  autoComplete="given-name"
                  autoFocus
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  {...register('firstName', {
                    required: 'El nombre es requerido',
                    minLength: {
                      value: 2,
                      message: 'El nombre debe tener al menos 2 caracteres',
                    },
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Apellido"
                  name="lastName"
                  autoComplete="family-name"
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  {...register('lastName', {
                    required: 'El apellido es requerido',
                    minLength: {
                      value: 2,
                      message: 'El apellido debe tener al menos 2 caracteres',
                    },
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Correo Electrónico"
                  name="email"
                  autoComplete="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  {...register('email', {
                    required: 'El correo electrónico es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Formato de correo electrónico inválido',
                    },
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="phone"
                  label="Teléfono (Opcional)"
                  name="phone"
                  autoComplete="tel"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  {...register('phone', {
                    pattern: {
                      value: /^[+]?[0-9\s\-()]+$/,
                      message: 'Formato de teléfono inválido',
                    },
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="role-label">Tipo de Usuario</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    label="Tipo de Usuario"
                    defaultValue="farmer"
                    error={!!errors.role}
                    {...register('role', {
                      required: 'El tipo de usuario es requerido',
                    })}
                  >
                    <MenuItem value="farmer">Agricultor</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  * Para roles de Técnico o Administrador, contacta al administrador del sistema
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 8,
                      message: 'La contraseña debe tener al menos 8 caracteres',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
                    },
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirmar Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  {...register('confirmPassword', {
                    required: 'Confirma tu contraseña',
                    validate: (value) =>
                      value === password || 'Las contraseñas no coinciden',
                  })}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isLoading}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                ¿Ya tienes cuenta? Inicia sesión aquí
              </Link>
            </Box>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1, width: '100%' }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              <strong>Nota:</strong> Al registrarte como agricultor tendrás acceso a todas las funcionalidades 
              básicas del sistema. Los técnicos agrícolas y administradores son asignados por el administrador del sistema.
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Al crear una cuenta, aceptas nuestros términos de servicio y política de privacidad
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;