const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  handleWebhook,
  getMyOrders,
  getAllOrders,
  getOrder,
  updateOrderStatus,
} = require('../controllers/orderController');

// Public routes
router.post('/create-checkout-session', createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes (would need auth middleware)
router.get('/my-orders', getMyOrders);
router.get('/', getAllOrders);
router.get('/:id', getOrder);
router.put('/:id/status', updateOrderStatus);

module.exports = router;