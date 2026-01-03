import apiClient from './apiClient';

export const fetchSuppliers = async () => {
    try {
        const response = await apiClient.get('/supplier/all_sup');
        return response.data;
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
    }
};

export const createSupplier = async (data) => {
    try {
        const response = await apiClient.post('/supplier/add_sup', data);
        return response.data;
    } catch (error) {
        console.error('Error creating supplier:', error);
        throw error;
    }
};

export const updateSupplier = async (data) => {
    try {
        const response = await apiClient.put('/supplier/update_sup', data);
        return response.data;
    } catch (error) {
        console.error('Error updating supplier:', error);
        throw error;
    }
};

export const deleteSupplier = async (id) => {
    try {
        const response = await apiClient.delete(`/supplier/delete_sup/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting supplier:', error);
        throw error;
    }
};

export const getLastSupplierTransactions = async (id) => {
    try {
        const response = await apiClient.get(`/supplier/last_transaction/${encodeURIComponent(id)}`);
        return response;
    } catch (error) {
        console.error('Error fetching last transaction:', error);
        throw error;
    }
};