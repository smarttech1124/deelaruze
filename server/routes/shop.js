// routes/publicationRoutes.js

const express = require('express');
const router = express.Router();

const {
  getProducts,
  createCart,
  addCartLines,
  getCart,
} = require('../controllers/shopifyController');

const {
  verifyWebhook,
  handleOrderPaid,
} = require('../controllers/shopifyWebhookController');

// ----------------------------------------
// Products (Shopify Storefront API)
// ----------------------------------------

// GET /api/publications
// Query params: ?first=20&query=title:book
router.get('/', getProducts);

// ----------------------------------------
// Cart / Checkout (Storefront Cart API)
// ----------------------------------------

// POST /api/publications/cart
// body: { lines: [{ merchandiseId, quantity }] }
router.post('/cart', createCart);

// GET /api/publications/cart/:id
router.get('/cart/:id', getCart);

// POST /api/publications/cart/:id/lines
router.post('/cart/:id/lines', addCartLines);

// ----------------------------------------
// Shopify Webhooks (Admin → Server)
// ----------------------------------------

// Must use express.raw({ type: 'application/json' }) at app level
router.post(
  '/webhooks/orders-paid',
  verifyWebhook,
  handleOrderPaid
);

module.exports = router;
