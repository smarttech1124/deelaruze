import api from './api';

export const contactService = {
  // Send contact message
  send: async (data) => {
    try {
      const response = await api.post('/contact', data);
      return response.data;
    } catch (error) {
      console.error('Error sending contact message:', error);
      throw error;
    }
  },

  // Get all messages (admin only)
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/contact', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      throw error;
    }
  },

  // Mark message as read (admin only)
  markAsRead: async (id) => {
    try {
      const response = await api.put(`/contact/${id}/read`);
      return response.data;
    } catch (error) {
      console.error(`Error marking message ${id} as read:`, error);
      throw error;
    }
  },

  // Delete message (admin only)
  delete: async (id) => {
    try {
      const response = await api.delete(`/contact/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting message ${id}:`, error);
      throw error;
    }
  },
};