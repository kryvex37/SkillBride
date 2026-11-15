import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor to handle auth expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and has token, clear stale token
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  forgotPassword: (data: any) => api.post('/auth/forgot-password', data),
};

export const projectApi = {
  getAll: (params?: any) => api.get('/projects', { params }),
  getById: (id: number | string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: number | string, data: any) => api.put(`/projects/${id}`, data),
  updateStatus: (id: number | string, status: string) => api.patch(`/projects/${id}/status`, { status }),
  delete: (id: number | string) => api.delete(`/projects/${id}`),
};

export const studentApi = {
  getProfile: (userId?: number | string) => api.get(userId ? `/students/profile/${userId}` : '/students/profile'),
  updateProfile: (data: any) => api.put('/students/profile', data),
  addSkill: (data: any) => api.post('/students/skills', data),
  removeSkill: (skillId: number | string) => api.delete(`/students/skills/${skillId}`),
  addPortfolioItem: (data: any) => api.post('/students/portfolio', data),
  updatePortfolioItem: (id: number | string, data: any) => api.put(`/students/portfolio/${id}`, data),
  deletePortfolioItem: (id: number | string) => api.delete(`/students/portfolio/${id}`),
  getRecommendations: () => api.get('/students/recommendations'),
};

export const clientApi = {
  getDashboard: () => api.get('/clients/dashboard'),
  getProfile: (clientId?: number | string) => api.get(clientId ? `/clients/profile/${clientId}` : '/clients/profile'),
  updateProfile: (data: any) => api.put('/clients/profile', data),
  getCandidates: (projectId: number | string) => api.get(`/clients/projects/${projectId}/candidates`),
};

export const applicationApi = {
  apply: (data: any) => api.post('/applications/apply', data),
  getMyApplications: () => api.get('/applications/my-applications'),
  getProjectApplications: (projectId: number | string) => api.get(`/applications/project/${projectId}`),
  updateStatus: (id: number | string, status: string, note?: string) => api.patch(`/applications/${id}/status`, { status, note }),
};

export const reviewApi = {
  create: (data: any) => api.post('/reviews', data),
  getUserReviews: (userId: number | string) => api.get(`/reviews/user/${userId}`),
};

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id: number | string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const skillApi = {
  getAll: () => api.get('/skills'),
  getCategories: () => api.get('/skills/categories'),
};

export const reportApi = {
  submit: (data: any) => api.post('/reports', data),
};

export const adminApi = {
  getOverview: () => api.get('/admin/overview'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  toggleUserStatus: (id: number | string, status: string) => api.patch(`/admin/users/${id}/status`, { status }),
  deleteProject: (id: number | string) => api.delete(`/admin/projects/${id}`),
  getReviews: () => api.get('/admin/reviews'),
  deleteReview: (id: number | string) => api.delete(`/admin/reviews/${id}`),
  getReports: () => api.get('/admin/reports'),
  resolveReport: (id: number | string, status: string, resolution_notes?: string) => api.patch(`/admin/reports/${id}/resolve`, { status, resolution_notes }),
};

export const uploadApi = {
  uploadAvatar: (formData: FormData) => api.post('/uploads/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadPortfolioImage: (formData: FormData) => api.post('/uploads/portfolio-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default api;
