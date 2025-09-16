import React from 'react';
import { Box, Typography } from '@mui/material';

const Profile = () => (
  <Box>
    <Typography variant="h4">Mi Perfil</Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>
      Gestiona tu información personal y configuraciones.
    </Typography>
  </Box>
);

export default Profile;