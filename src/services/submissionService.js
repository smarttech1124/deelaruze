import api from './api';

export const submissionService = {
  // Create new submission
  create: async (formData) => {
    try {
      const response = await api.post('/submissions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  },

  // Get all submissions (admin only)
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/submissions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  },

  // Get single submission (admin only)
  getById: async (id) => {
    try {
      const response = await api.get(`/submissions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching submission ${id}:`, error);
      throw error;
    }
  },

  // Update submission status (admin only)
  updateStatus: async (id, status, notes = '') => {
    try {
      const response = await api.put(`/submissions/${id}/status`, {
        status,
        notes,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating submission ${id}:`, error);
      throw error;
    }
  },

  // Delete submission (admin only)
  delete: async (id) => {
    try {
      const response = await api.delete(`/submissions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting submission ${id}:`, error);
      throw error;
    }
  },
};