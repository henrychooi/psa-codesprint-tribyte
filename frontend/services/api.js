/**
 * API service for Career Compass
 */
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Redirect to login if unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Re-throw the original error to preserve error.response structure
    return Promise.reject(error);
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

  // Leadership Potential endpoints
  getLeadershipPotential: async (employeeId) => {
    const response = await api.get(`/leadership-potential/${employeeId}`);
    return response.data;
  },

  submitLeadershipFeedback: async (employeeId, feedbackType, comments = '') => {
    const response = await api.post('/leadership-feedback', {
      employee_id: employeeId,
      feedback_type: feedbackType,
      comments: comments,
    });
    return response.data;
  },

  // Chat/Copilot endpoints
  sendChatMessage: async (employeeId, message, conversationHistory = []) => {
    const response = await api.post('/chat', {
      message: message,  // employee_id now comes from auth token
      conversation_history: conversationHistory,
    });
    return response.data;
  },

  // Authentication endpoints
  login: async (username, password) => {
    const response = await api.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  getDemoUsers: async () => {
    const response = await api.get('/auth/demo-users');
    return response.data;
  },
};

// Standalone auth functions for easier import
export const login = careerCompassAPI.login;
export const verifyToken = careerCompassAPI.verifyToken;
export const getDemoUsers = careerCompassAPI.getDemoUsers;

// User settings functions
export const updateUsername = async (newUsername) => {
  const response = await api.put('/user/update-username', {
    new_username: newUsername,
  });
  return response.data;
};

export default api;
