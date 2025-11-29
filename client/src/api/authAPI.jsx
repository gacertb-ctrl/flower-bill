// client/api/authAPI.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export const loginUser = async (username, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            username,
            password
        });

        // Return token and user data
        return {
            token: response.data.token,
            user: response.data.user
        };
    } catch (error) {
        let errorMessage = 'Login failed. Please try again.';

        if (error.response) {
            if (error.response.status === 401) {
                errorMessage = 'Invalid username or password.';
            } else if (error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;
            }
        }

        throw new Error(errorMessage);
    }
};

export const logoutUser = async () => {
    try {
        // If you have server-side logout logic
        await axios.post(`${API_BASE_URL}/auth/logout`);
    } catch (error) {
        console.error('Logout error:', error);
    }
};

export const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        return Promise.resolve(null); // Or return a default object indicating not authenticated
    }
    try {
        const response = await axios.get(`${API_BASE_URL}/auth/check`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        // Consider handling specific error codes, e.g., 401 for expired token
        // For now, assume any error means not authenticated
        return Promise.resolve(null);
    }
};

export const refreshToken = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: localStorage.getItem('refreshToken')
        });

        localStorage.setItem('authToken', response.data.token);
        return response.data.token;
    } catch (error) {
        throw new Error('Session expired. Please login again.');
    }
};
