import React from 'react';
import { Box, Typography } from '@mui/material';

const AdminPanel = () => (
  <Box>
    <Typography variant="h4">Panel de Administración</Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>
      Gestión completa del sistema y usuarios.
    </Typography>
  </Box>
);

export default AdminPanel;