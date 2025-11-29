// client/api/customerAPI.jsx
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

export const fetchCustomers = async () => {
  const response = await axiosInstance.get('customer/all_cus');
  return response.data;
};

export const createCustomer = async (data) => {
  const response = await axiosInstance.post('customer/add_cus', data);
  return response;
};

export const getLastCustomerTransactions = async (data) => {
  const response = await axiosInstance.post('/customer/last_transaction', data);
  return response;
};

export const updateCustomer = async (data) => {
  const response = await axiosInstance.post('customer/update_cus', data);
  return response;
};

export const deleteCustomer = async (code) => {
  const response = await axiosInstance.delete(`customer/delete_cus/${code}`);
  return response;
};