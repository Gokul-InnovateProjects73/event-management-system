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
};

// Events
export const eventAPI = {
    getAll: (params) => api.get('/events', { params }),
    getById: (id) => api.get(`/events/${id}`),
    getMyEvents: () => api.get('/events/my-events'),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.put(`/events/${id}`, data),
    delete: (id) => api.delete(`/events/${id}`),
};

// RSVPs
export const rsvpAPI = {
    submit: (data) => api.post('/rsvps', data),
    getForEvent: (eventId) => api.get(`/rsvps/event/${eventId}`),
    getMyRSVP: (eventId) => api.get(`/rsvps/my/${eventId}`),
    getMyRSVPEvents: () => api.get('/rsvps/my-events'),
};

export default api;
