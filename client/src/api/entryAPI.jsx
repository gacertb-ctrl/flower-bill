import apiClient from './apiClient';

export const createPurchaseEntry = async (entryData) => {
  try {
    const response = await apiClient.post('/entry/purchase_entry', entryData);
    return response.data;
  } catch (error) {
    console.error('Error creating purchase entry:', error);
    throw error;
  }
};

export const createSalesEntry = async (entryData) => {
  try {
    const response = await apiClient.post('/entry/sales_entry', entryData);
    return response.data;
  } catch (error) {
    console.error('Error creating sales entry:', error);
    throw error;
  }
};

export const createCreditEntry = async (entryData) => {
  try {
    const response = await apiClient.post('/entry/credit_entry', entryData);
    return response.data;
  } catch (error) {
    console.error('Error creating credit entry:', error);
    throw error;
  }
};

export const createDebitEntry = async (entryData) => {
  try {
    const response = await apiClient.post('/entry/debit_entry', entryData);
    return response.data;
  } catch (error) {
    console.error('Error creating debit entry:', error);
    throw error;
  }
};
// --- NEW UPDATE FUNCTIONS ---
export const updatePurchaseEntry = async (entryData) => {
  try {
    // entryData should include: { id, quantity, price, product_code }
    const response = await apiClient.put('/entry/update_purchase', entryData);
    return response.data;
  } catch (error) {
    console.error('Error updating purchase entry:', error);
    throw error;
  }
};

export const updateSalesEntry = async (entryData) => {
  try {
    // entryData should include: { id, quantity, price, product_code }
    const response = await apiClient.put('/entry/update_sales', entryData);
    return response.data;
  } catch (error) {
    console.error('Error updating sales entry:', error);
    throw error;
  }
};

export const deleteSalesEntry = async (entryData) => {
  try {
    const response = await apiClient.post('/entry/delete_sales', entryData);
    return response.data;
  } catch (error) {
    console.error('Error deleting sales entry:', error);
    throw error;
  }
};

export const deletePurchaseEntry = async (entryData) => {
  try {
    const response = await apiClient.post('/entry/delete_purchase', entryData);
    return response.data;
  } catch (error) {
    console.error('Error deleting purchase entry:', error);
    throw error;
  }
};

export const deleteCreditEntry = async (entryData) => {
  try {
    const response = await apiClient.post('/entry/delete_credit', entryData);
    return response.data;
  } catch (error) {
    console.error('Error deleting credit entry:', error);
    throw error;
  }
};

export const deleteDebitEntry = async (entryData) => {
  try {
    const response = await apiClient.post('/entry/delete_debit', entryData);
    return response.data;
  } catch (error) {
    console.error('Error deleting debit entry:', error);
    throw error;
  }
};

export const getAllPurchaseEntries = async (date) => {
  try {
    const response = await apiClient.get('/entry/purchase_entry', { params: { date } });
    return response.data;
  } catch (error) {
    console.error('Error getting all purchase entries:', error);
    throw error;
  }
};

export const getAllSalesEntries = async (date) => {
  try {
    const response = await apiClient.get('/entry/sales_entry', { params: { date } });
    return response.data;
  } catch (error) {
    console.error('Error getting all sales entries:', error);
    throw error;
  }
};

export const getAllCreditEntries = async (date) => {
  try {
    const response = await apiClient.get('/entry/credit_entry', { params: { date } });
    return response.data;
  } catch (error) {
    console.error('Error getting all credit entries:', error);
    throw error;
  }
};

export const getAllDebitEntries = async (date) => {
  try {
    const response = await apiClient.get('/entry/debit_entry', { params: { date } });
    return response.data;
  } catch (error) {
    console.error('Error getting all debit entries:', error);
    throw error;
  }
};