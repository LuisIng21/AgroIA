import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any request modifications here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access detected');
      // You might want to redirect to login or refresh token here
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
};

// Pest API
export const pestAPI = {
  getAllPests: (params) => api.get('/pests', { params }),
  getPestById: (id) => api.get(`/pests/${id}`),
  searchPests: (searchData) => api.post('/pests/search', searchData),
  getPestStats: () => api.get('/pests/stats/overview'),
};

// AI API
export const aiAPI = {
  analyzeImage: (formData) => api.post('/ai/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDetections: (params) => api.get('/ai/detections', { params }),
  getDetectionById: (id) => api.get(`/ai/detections/${id}`),
  updateDetectionStatus: (id, data) => api.put(`/ai/detections/${id}/status`, data),
};

// Recommendation API
export const recommendationAPI = {
  getRecommendationsForPest: (pestId, params) => api.get(`/recommendations/pest/${pestId}`, { params }),
  getPersonalizedRecommendations: (data) => api.post('/recommendations/personalized', data),
  recordTreatment: (data) => api.post('/recommendations/apply', data),
  getTreatmentHistory: (params) => api.get('/recommendations/treatments', { params }),
  updateTreatmentEffectiveness: (id, data) => api.put(`/recommendations/treatments/${id}/effectiveness`, data),
};

// Geolocation API
export const geoAPI = {
  getFarms: () => api.get('/geolocation/farms'),
  createFarm: (farmData) => api.post('/geolocation/farms', farmData),
  updateFarmLocation: (farmId, locationData) => api.put(`/geolocation/farms/${farmId}/location`, locationData),
  getNearbyFarms: (params) => api.get('/geolocation/nearby', { params }),
  getPestMap: (params) => api.get('/geolocation/pest-map', { params }),
  getWeatherData: (farmId, params) => api.get(`/geolocation/farms/${farmId}/weather`, { params }),
};

// Dashboard API
export const dashboardAPI = {
  getOverview: (params) => api.get('/dashboard/overview', { params }),
  getTrends: (params) => api.get('/dashboard/trends', { params }),
  getGeoDistribution: (params) => api.get('/dashboard/geo-distribution', { params }),
  getUserActivity: (params) => api.get('/dashboard/user-activity', { params }),
};

// User API
export const userAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserStats: () => api.get('/users/stats/overview'),
};

export default api;