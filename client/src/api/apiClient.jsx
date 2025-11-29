// client/api/apiClient.js
import axios from 'axios';
import { refreshToken } from './authAPI';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL
});

// Add auth token to requests
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token expiration
apiClient.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // If error is due to token expiration
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newToken = await refreshToken();
                localStorage.setItem('authToken', newToken);

                // Update the Authorization header
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                // Retry the original request
                return apiClient(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login
                console.error('Token refresh failed:', refreshError);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;