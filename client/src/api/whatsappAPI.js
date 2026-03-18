import apiClient from './apiClient';

export const getWhatsAppStatus = async () => {
    try {
        const response = await apiClient.get('/api/whatsapp/status');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const connectWhatsApp = async () => {
    try {
        const response = await apiClient.get('/api/whatsapp/connect');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const disconnectWhatsApp = async () => {
    try {
        const response = await apiClient.post('/api/whatsapp/disconnect');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const sendReportWhatsApp = async (payload) => {
    try {
        const response = await apiClient.post('/api/whatsapp/send', payload);
        return response.data;
    } catch (error) {
        throw error;
    }
};
