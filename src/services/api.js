import axios from 'axios';
import { API_URL } from '../productionLink/productionLink';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && window.location.pathname !== '/login' && window.location.pathname !== '/') {
            // Auto logout: Clear token and user immediately from storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('school');
            localStorage.removeItem('role');

            // Dispatch session expired event to trigger auto-redirect popup
            window.dispatchEvent(new CustomEvent('session_expired', {
                detail: { message: error.response.data?.message || 'Your session has expired (401 Unauthorized).' }
            }));
        }
        return Promise.reject(error);
    }
);

// ==================== AUTH API ====================
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getCurrentUser: () => api.get('/auth/me')
};

// ==================== STUDENT API ====================
export const studentAPI = {
    getProfile: () => api.get('/student/profile'),
    getAttendance: () => api.get('/student/attendance'),
    getFees: () => api.get('/student/fees'),
    getGrievances: () => api.get('/student/grievances'),
    submitGrievance: (data) => api.post('/student/grievances', data),
    getAnnouncements: () => api.get('/student/announcements')
};

// ==================== TEACHER API ====================
export const teacherAPI = {
    getProfile: () => api.get('/teacher/profile'),
    getStudents: () => api.get('/teacher/students'),
    markAttendance: (data) => api.post('/teacher/attendance', data),
    getRequisitions: () => api.get('/teacher/requisitions'),
    createRequisition: (data) => api.post('/teacher/requisitions', data)
};

// ==================== ACCOUNTS API ====================
export const accountsAPI = {
    getDashboard: () => api.get('/accounts/dashboard'),
    getFees: (params) => api.get('/accounts/fees', { params }),
    getFeeDetails: (id) => api.get(`/accounts/fees/${id}`),
    recordPayment: (data) => api.post('/accounts/payments', data),
    getPendingAdmissions: () => api.get('/accounts/pending-admissions')
};

// ==================== ADMIN API ====================
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUserStatus: (id, data) => api.put(`/admin/users/${id}`, data),
    getRequisitions: (params) => api.get('/admin/requisitions', { params }),
    updateRequisition: (id, data) => api.put(`/admin/requisitions/${id}`, data),
    getGrievances: (params) => api.get('/admin/grievances', { params }),
    updateGrievance: (id, data) => api.put(`/admin/grievances/${id}`, data),
    getBatches: () => api.get('/admin/batches'),
    assignBatch: (data) => api.post('/admin/batch-assignment', data)
};

// ==================== ADMISSION API ====================
export const admissionAPI = {
    getDashboard: () => api.get('/admission/dashboard'),
    getApplications: (params) => api.get('/admission/applications', { params }),
    getApplicationDetails: (id) => api.get(`/admission/applications/${id}`),
    createApplication: (data) => api.post('/admission/applications', data),
    admitApplication: (id, data) => api.put(`/admission/applications/${id}/admit`, data),
    rejectApplication: (id, data) => api.put(`/admission/applications/${id}/reject`, data)
};

export default api;