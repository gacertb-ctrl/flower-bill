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

export const getLastSupplierTransactions = async (id, fromDate = '', toDate = '') => {
    try {
        // Constructing URL with optional query parameters for filtering
        let url = `/supplier/last_transaction/${encodeURIComponent(id)}`;
        if (fromDate && toDate) {
            url += `?fromDate=${fromDate}&toDate=${toDate}`;
        }
        const response = await apiClient.get(url);
        return response; // Returns the full response object
    } catch (error) {
        console.error('Error fetching last transaction:', error);
        throw error;
    }
};
