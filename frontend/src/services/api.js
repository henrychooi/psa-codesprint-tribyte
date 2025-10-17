/**
 * API service for Career Compass
 */
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.error || 'An error occurred');
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

export const careerCompassAPI = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Employee endpoints
  getEmployees: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  getEmployee: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}`);
    return response.data;
  },

  searchEmployees: async (query) => {
    const response = await api.get('/employees/search', {
      params: { q: query },
    });
    return response.data;
  },

  // Role endpoints
  getRoles: async () => {
    const response = await api.get('/roles');
    return response.data;
  },

  getRole: async (roleId) => {
    const response = await api.get(`/roles/${roleId}`);
    return response.data;
  },

  // Matching endpoints
  matchEmployee: async (employeeId, topK = 5, generateNarrative = true) => {
    const response = await api.get(`/match/employee/${employeeId}`, {
      params: {
        top_k: topK,
        generate_narrative: generateNarrative,
      },
    });
    return response.data;
  },

  // Narrative generation
  generateNarrative: async (employeeId, roleId) => {
    const response = await api.post('/narrative/generate', {
      employee_id: employeeId,
      role_id: roleId,
    });
    return response.data;
  },
};

export default api;
