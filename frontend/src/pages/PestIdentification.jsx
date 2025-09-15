import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { CameraAlt as CameraIcon } from '@mui/icons-material';

const PestIdentification = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Identificación de Plagas
      </Typography>
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <CameraIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Análisis de Imágenes con IA
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Sube una imagen de tu cultivo para identificar plagas y enfermedades automáticamente
          </Typography>
          <Button variant="contained" size="large">
            Subir Imagen
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PestIdentification;