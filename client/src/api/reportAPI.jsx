import apiClient from './apiClient';

export const getReportSummary = async (params) => {
    const response = await apiClient.get('/report/summary', { params });
    return response.data;
};

export const getTamilMonths = async () => {
    const response = await apiClient.get('/report/tamil-months');
    return response.data;
};

export const getPrintDetails = async (params) => {
    const response = await apiClient.get('/report/print-details', { params });
    return response.data;
};

export const updateSupplierOD = async (data) => {
    const response = await apiClient.put(`/report/supplier/monthlyod`, data);
    return response.data;
}