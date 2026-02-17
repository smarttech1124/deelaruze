const express = require('express');
const router = express.Router();
const {
  handleWebhook,
} = require('../controllers/orderController');

// Public routes
router.post('/stripe', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;