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

export const createPurchaseEntry = async (entryData) => {
  try {
    const response = await axiosInstance.post('/entry/purchase_entry', entryData);
    return response.data;
  } catch (error) {
    console.error('Error creating purchase entry:', error);
    throw error;
  }
};

export const createSalesEntry = async (entryData) => {
  try {
    const response = await axiosInstance.post('/entry/sales_entry', entryData);
    return response.data;
  } catch (error) {
    console.error('Error creating sales entry:', error);
    throw error;
  }
};

export const createCreditEntry = async (entryData) => {
  try {
    const response = await axiosInstance.post('/entry/credit_entry', entryData);
    return response.data;
  } catch (error) {
    console.error('Error creating credit entry:', error);
    throw error;
  }
};

export const createDebitEntry = async (entryData) => {
  try {
    const response = await axiosInstance.post('/entry/debit_entry', entryData);
    return response.data;
  } catch (error) {
    console.error('Error creating debit entry:', error);
    throw error;
  }
};

export const deleteSalesEntry = async (entryData) => {
  try {
    const response = await axiosInstance.post('/entry/delete_sales', entryData);
    return response.data;
  } catch (error) {
    console.error('Error deleting sales entry:', error);
    throw error;
  }
};

export const deletePurchaseEntry = async (entryData) => {
  try {
    const response = await axiosInstance.post('/entry/delete_purchase', entryData);
    return response.data;
  } catch (error) {
    console.error('Error deleting purchase entry:', error);
    throw error;
  }
};

export const deleteCreditEntry = async (entryData) => {
  try {
    const response = await axiosInstance.post('/entry/delete_credit', entryData);
    return response.data;
  } catch (error) {
    console.error('Error deleting credit entry:', error);
    throw error;
  }
};

export const deleteDebitEntry = async (entryData) => {
  try {
    const response = await axiosInstance.post('/entry/delete_debit', entryData);
    return response.data;
  } catch (error) {
    console.error('Error deleting debit entry:', error);
    throw error;
  }
};

export const getAllPurchaseEntries = async (date) => {
  try {
    const response = await axiosInstance.get(`/entry/purchase_entry?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Error getting all purchase entries:', error);
    throw error;
  }
};

export const getAllSalesEntries = async (date) => {
  try {
    const response = await axiosInstance.get(`/entry/sales_entry?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Error getting all sales entries:', error);
    throw error;
  }
};

export const getAllCreditEntries = async (date) => {
  try {
    const response = await axiosInstance.get(`/entry/credit_entry?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Error getting all credit entries:', error);
    throw error;
  }
};

export const getAllDebitEntries = async (date) => {
  try {
    const response = await axiosInstance.get(`/entry/debit_entry?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Error getting all debit entries:', error);
    throw error;
  }
};
