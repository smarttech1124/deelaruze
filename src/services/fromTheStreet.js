import api from './api';

export const fromTheStreet = {
  getAll: async () => {
    try {
      const response = await api.get('/fromthestreet');
      return response.data;
    } catch (error) {
      console.error('Error fetching from the street data:', error);
      throw error;
    }
  }, 
}