    // client/src/api/supplierAPI.jsx
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const fetchSuppliers = async () => {
    try {
        const response = await axiosInstance.get('/supplier/all_sup');
        return response.data;
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
    }
};

export const createSupplier = async (data) => {
    try {
        const response = await axiosInstance.post('/supplier/add_sup', data);
        return response.data;
    } catch (error) {
        console.error('Error creating supplier:', error);
        throw error;
    }
};

export const updateSupplier = async (data) => {
    try {
        const response = await axiosInstance.put('/supplier/update_sup', data);
        return response.data;
    } catch (error) {
        console.error('Error updating supplier:', error);
        throw error;
    }
};

export const deleteSupplier = async (id) => {
    try {
        const response = await axiosInstance.delete(`/supplier/delete_sup/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting supplier:', error);
        throw error;
    }
};

export const getLastSupplierTransactions = async (page, id) => {
  try {
    const response = await axiosInstance.get(`/supplier/last_transaction/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching last transaction:', error);
    throw error;
  }
};

// Add other supplier-related API calls here, e.g., updateSupplier, createSupplier, deleteSupplier

