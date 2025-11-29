// client/src/api/stockAPI.jsx
import apiClient from './apiClient';

export const fetchStocks = async (date) => {
  try {
    let url = '/stock/stocks';
    if (date) {
      // Format the date to YYYY-MM-DD
      const formattedDate = date.toISOString().slice(0, 10);
      url += `?date=${formattedDate}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    throw error;
  }
};

// Add other stock-related API calls here, e.g., updateStock, createStock, deleteStock
