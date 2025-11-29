import apiClient from './apiClient';

export const getDebitEntries = async (date) => {
    const response = await apiClient.get('/debit-credit/debit', { params: { date } });
    return response.data;
};

export const getCreditEntries = async (date) => {
    const response = await apiClient.get('/debit-credit/credit', { params: { date } });
    return response.data;
};

export const createDebitEntry = async (data) => {
    return await apiClient.post('/debit-credit/debit', data);
};

export const createCreditEntry = async (data) => {
    return await apiClient.post('/debit-credit/credit', data);
};

export const deleteDebitEntry = async (id) => {
    return await apiClient.delete(`/debit-credit/debit/${id}`);
};

export const deleteCreditEntry = async (id) => {
    return await apiClient.delete(`/debit-credit/credit/${id}`);
};