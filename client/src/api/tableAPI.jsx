import apiClient from './apiClient';

export const fetchTableData = async (page) => {
  try {
    // Ensure the page variable generates a valid path (e.g. start with / if needed, 
    // but usually apiClient baseURL handles the root)
    const url = `/${page}`;

    // apiClient automatically attaches the Authorization header if the token exists
    const response = await apiClient.post(url, {});
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${page} data:`, error);
    throw error;
  }
};