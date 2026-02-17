const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  verifyCheckoutSession,
  handleWebhook,
  getMyOrders,
  getAllOrders,
  getOrder,
  updateOrderStatus,
} = require('../controllers/orderController');

// Public routes
router.post('/create-checkout-session', createCheckoutSession);
router.get('/verify-session', verifyCheckoutSession);
router.post('/webhook', handleWebhook);

// Protected routes (would need auth middleware)
router.get('/my-orders', getMyOrders);
router.get('/', getAllOrders);
router.get('/:id', getOrder);
router.put('/:id/status', updateOrderStatus); 

module.exports = router;