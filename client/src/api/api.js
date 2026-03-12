import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auth
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.patch('/auth/profile', data),
    getAllUsers: () => api.get('/auth/users'),
};

// Events
export const eventAPI = {
    getAll: (params) => api.get('/events', { params }),
    getById: (id) => api.get(`/events/${id}`),
    getMyEvents: () => api.get('/events/my-events'),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.put(`/events/${id}`, data),
    updateStatus: (id, status) => api.patch(`/events/${id}/status`, { status }),
    delete: (id) => api.delete(`/events/${id}`),
};

// RSVPs
export const rsvpAPI = {
    submit: (data) => api.post('/rsvps', data),
    getForEvent: (eventId) => api.get(`/rsvps/event/${eventId}`),
    getMyRSVP: (eventId) => api.get(`/rsvps/my/${eventId}`),
    getMyRSVPEvents: () => api.get('/rsvps/my-events'),
    checkIn: (token) => api.post('/rsvps/checkin', { token }),
    cancel: (rsvpId) => api.delete(`/rsvps/${rsvpId}`),
    export: (eventId) => api.get(`/rsvps/export/${eventId}`, { responseType: 'blob' }),
};

// Speakers
export const speakerAPI = {
    getForEvent: (eventId) => api.get('/speakers', { params: { event: eventId } }),
    create: (data) => api.post('/speakers', data),
    delete: (id) => api.delete(`/speakers/${id}`),
};

// Notifications
export const notificationAPI = {
    getAll: () => api.get('/notifications'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllRead: () => api.patch('/notifications/read-all'),
};

// Analytics
export const analyticsAPI = {
    getOverview: () => api.get('/analytics/overview'),
    getRegistrationsOverTime: () => api.get('/analytics/registrations-over-time'),
    getByCategory: () => api.get('/analytics/by-category'),
    getRecentActivity: () => api.get('/analytics/recent-activity'),
};

// Admin
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getStudents: (dept) => api.get('/admin/students', { params: dept && dept !== 'all' ? { dept } : {} }),
    getEventRSVPs: (eventId) => api.get(`/admin/events/${eventId}/rsvps`),
    getRSVPsByDept: () => api.get('/admin/rsvps-by-dept'),
    getAllRegistrations: () => api.get('/admin/registrations'),
    getAllUsers: () => api.get('/admin/users'),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;
