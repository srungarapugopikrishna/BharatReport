import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
// CSRF header hook (if backend requires a custom header)
api.interceptors.request.use((config) => {
  const csrf = localStorage.getItem('csrfToken');
  if (csrf) {
    config.headers['X-CSRF-Token'] = csrf;
  }
  return config;
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleLogin: (googleToken) => api.post('/auth/google', { token: googleToken }),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  bootstrapAdmin: (email, secret) => api.post('/auth/bootstrap-admin', { email, secret }),
};

// Issues API
export const issuesAPI = {
  getIssues: (params) => api.get('/issues', { params }),
  getIssue: (id) => api.get(`/issues/${id}`),
  createIssue: (issueData) => api.post('/issues', issueData),
  updateIssue: (id, issueData) => api.put(`/issues/${id}`, issueData),
  updateIssueStatus: (id, statusData) => api.patch(`/issues/${id}/status`, statusData),
  addComment: (id, commentData) => api.post(`/issues/${id}/comments`, commentData),
  upvoteIssue: (id) => api.post(`/issues/${id}/upvote`),
  getMyIssues: (params) => api.get('/issues/user/my-issues', { params }),
  flagIssue: (id, reason) => api.post(`/issues/${id}/flag`, { reason }),
};

// Categories API
export const categoriesAPI = {
  getCategories: () => api.get('/categories'),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  getSubcategories: (categoryId) => api.get(`/categories/${categoryId}/subcategories`),
  createSubcategory: (categoryId, subcategoryData) => api.post(`/categories/${categoryId}/subcategories`, subcategoryData),
  updateSubcategory: (id, subcategoryData) => api.put(`/categories/subcategories/${id}`, subcategoryData),
  deleteSubcategory: (id) => api.delete(`/categories/subcategories/${id}`),
};

// Officials API
export const officialsAPI = {
  getOfficials: (params) => api.get('/officials', { params }),
  getOfficial: (id) => api.get(`/officials/${id}`),
  createOfficial: (officialData) => api.post('/officials', officialData),
  updateOfficial: (id, officialData) => api.put(`/officials/${id}`, officialData),
  deleteOfficial: (id) => api.delete(`/officials/${id}`),
  getSuggestedOfficials: (params) => api.get('/officials/suggest', { params }),
  getOfficialIssues: (id, params) => api.get(`/officials/${id}/issues`, { params }),
  getOfficialStats: (id) => api.get(`/officials/${id}/stats`),
};

// Authorities API
export const authoritiesAPI = {
  getAuthorities: (params) => api.get('/authorities', { params }),
  getAuthority: (id) => api.get(`/authorities/${id}`),
  createAuthority: (data) => api.post('/authorities', data),
  updateAuthority: (id, data) => api.put(`/authorities/${id}`, data),
  deleteAuthority: (id) => api.delete(`/authorities/${id}`),
  getAuthoritiesByCategory: (categoryId) => api.get(`/authorities/category/${categoryId}`),
  getAuthoritiesBySubcategory: (subcategoryId) => api.get(`/authorities/subcategory/${subcategoryId}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
  getHeatmap: (params) => api.get('/analytics/heatmap', { params }),
  getCategoryAnalytics: (params) => api.get('/analytics/categories', { params }),
  getOfficialAnalytics: () => api.get('/analytics/officials'),
};

// Admin API
export const adminAPI = {
  getIssues: (params) => api.get('/admin/issues', { params }),
  approveIssue: (id) => api.post(`/admin/issues/${id}/approve`),
  rejectIssue: (id, reason) => api.post(`/admin/issues/${id}/reject`, { reason }),
  editIssue: (id, data) => api.put(`/admin/issues/${id}`, data),
  listUsers: () => api.get('/admin/users'),
  banUser: (id) => api.post(`/admin/users/${id}/ban`),
  unbanUser: (id) => api.post(`/admin/users/${id}/unban`),
  listCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
};

// Constituency API
export const constituencyAPI = {
  findConstituencies: (lat, lng) => {
    const url = `https://know-your-leader.onrender.com//api/find-constituencies/?format=json&lat=${lat}&lng=${lng}`;
    return fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  }
};

// File upload utility
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

export default api;
