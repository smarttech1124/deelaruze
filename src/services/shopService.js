import api from './api';

export const shopService = {
  // Get all shop with optional filters
  getAll: async () => {
    try {
      const response = await api.get('/shop');
      return response.data;
    } catch (error) {
      console.error('Error fetching shop items:', error);
      throw error;
    }
  }, 

  // Get single shop by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/shop/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching shop item ${id}:`, error);
      throw error;
    }
  },

  // Get shop by slug
  getBySlug: async (slug) => {
    try {
      const response = await api.get(`/shop/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching shop ${slug}:`, error);
      throw error;
    }
  },

  // Get featured shop
  getFeatured: async () => {
    try {
      const response = await api.get('/shop/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured shop item:', error);
      throw error;
    }
  },

  // Get shop by category
  getByCategory: async (category) => {
    try {
      const response = await api.get(`/shop/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${category} shop:`, error);
      throw error;
    }
  },
};