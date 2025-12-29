import apiClient from './apiClient';

// Org Settings
export const getOrgSettings = async () => (await apiClient.get('/org/settings')).data;
export const updateOrgSettings = async (data) => await apiClient.put('/org/settings', data);

// Password
export const changePassword = async (data) => await apiClient.post('/org/change-password', data);

// Staff Management
export const getStaff = async () => (await apiClient.get('/users/staff')).data;
export const createStaff = async (data) => await apiClient.post('/users/staff', data);
export const deleteStaff = async (id) => await apiClient.delete(`/users/staff/${id}`);