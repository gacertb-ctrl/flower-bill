// client/api/productAPI.js
import apiClient from './apiClient';

export const createProduct = async (productData) => {
    const response = await apiClient.post('/product/add_pro', productData);
    return response.data;
};

export const updateProduct = async ( productData) => {
    const response = await apiClient.put(`/product/update_pro`, productData);
    return response.data;
};

export const getProductByCode = async (productCode) => {
    const response = await apiClient.get(`/product/${productCode}`);
    return response.data;
};

export const fetchProducts = async () => {
    const response = await apiClient.get('/product/products');
    return response.data;
};
