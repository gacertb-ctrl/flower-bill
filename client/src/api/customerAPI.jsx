import apiClient from './apiClient';

export const fetchCustomers = async () => {
  const response = await apiClient.get('/customer/all_cus');
  return response.data;
};

export const createCustomer = async (data) => {
  const response = await apiClient.post('/customer/add_cus', data);
  return response;
};

export const getLastCustomerTransactions = async (data) => {
  console.log("Fetching last transactions with data:", data);
  const response = await apiClient.post('/customer/last_transaction', data);
  return response;
};

export const updateCustomer = async (data) => {
  const response = await apiClient.post('/customer/update_cus', data);
  return response;
};

export const deleteCustomer = async (code) => {
  const response = await apiClient.delete(`/customer/delete_cus/${code}`);
  return response;
};