// client/api/tableAPI.js
import axios from 'axios';

export const fetchTableData = async (page) => {
  try {
    let url = `/${page}`;
    const token = localStorage.getItem('authToken'); // Or 'authToken'
    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    };
    const response = await axios.post(url, {}, config);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${page} data:`, error);
    throw error;
  }
};
