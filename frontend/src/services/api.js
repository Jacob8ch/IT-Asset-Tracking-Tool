import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Asset Services
export const assetService = {
  getAssets: (page = 1, filters = {}) => api.get('/assets', { params: { page, ...filters } }),
  getAsset: (id) => api.get(`/assets/${id}`),
  createAsset: (data) => api.post('/assets', data),
  updateAsset: (id, data) => api.put(`/assets/${id}`, data),
  scanBarcode: (tag) => api.get(`/assets/scan/${tag}`),
  
  // Loaner Management
  assignLoaner: (data) => api.post('/assets/loaner/assign', data),
  returnLoaner: (assignmentId) => api.post(`/assets/loaner/${assignmentId}/return`),
  getActiveLoaners: () => api.get('/assets/loaner/active'),
  
  // Groups
  getGroups: () => api.get('/assets/groups'),
  createGroup: (data) => api.post('/assets/groups', data),
  
  // Maintenance
  createMaintenanceRecord: (assetId, data) => api.post(`/assets/${assetId}/maintenance`, data),
  completeMaintenanceRecord: (recordId) => api.post(`/assets/maintenance/${recordId}/complete`),
};

// Ticket Services
export const ticketService = {
  getTickets: (page = 1, filters = {}) => api.get('/tickets', { params: { page, ...filters } }),
  getTicket: (id) => api.get(`/tickets/${id}`),
  createTicket: (data) => api.post('/tickets', data),
  updateTicket: (id, data) => api.put(`/tickets/${id}`, data),
  addTicketAsset: (ticketId, assetId) => api.post(`/tickets/${ticketId}/assets`, { asset_id: assetId }),
  addTicketComment: (ticketId, content) => api.post(`/tickets/${ticketId}/comments`, { content }),
  uploadAttachment: (ticketId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Admin Services
export const adminService = {
  getUsers: () => api.get('/admin/users'),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
};

// Google Admin Services
export const googleService = {
  syncDevices: () => api.post('/google/sync/devices'),
  getOUs: () => api.get('/google/ous'),
};

export default api;
