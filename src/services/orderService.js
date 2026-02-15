import api from './api';

export const orderService = {
  // Create Stripe checkout session
  createCheckoutSession: async ({ items, shippingfee, total }) => {
    try {
      const response = await api.post('/orders/create-checkout-session', {
        items,
        shippingfee,
        total,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  verifyStripeSession: async (sessionId) => {
    try {
      const response = await api.get(
        `/orders/verify-session?session_id=${sessionId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error verifying Stripe session:', error);
      throw error;
    }
  },


  // Get user's orders
  getMyOrders: async () => {
    try {
      const response = await api.get('/orders/my-orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get single order
  getById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },

  // Get all orders (admin only)
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  },

  // Update order status (admin only)
  updateStatus: async (id, status) => {
    try {
      const response = await api.put(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${id}:`, error);
      throw error;
    }
  },
};