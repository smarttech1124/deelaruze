import api from './api';

export const publicationService = {
  // Get all publication
  getAll: async () => {
    try {
      const response = await api.get('/publications');
      return response.data;
    } catch (error) {
      console.error('Error fetching publication:', error);
      throw error;
    }
  }, 

  // Get single publication by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/publications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching publication item ${id}:`, error);
      throw error;
    }
  },

  // Create new publication (admin only)
  create: async (data) => {
    try {
      const response = await api.post('/publications', data);
      return response.data;
    } catch (error) {
      console.error('Error creating publication:', error);
      throw error;
    }
  },

  // Update publication (admin only)
  update: async (id, data) => {
    try {
      const response = await api.put(`/publications/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating publication ${id}:`, error);
      throw error;
    }
  },

  // Delete publication (admin only)
  delete: async (id) => {
    try {
      const response = await api.delete(`/publications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting publication ${id}:`, error);
      throw error;
    }
  },

  // Upload images for publication
  uploadImages: async (id, files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await api.post(
        `/publications/${id}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  },
};