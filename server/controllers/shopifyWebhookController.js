// Inventory sync via order webhooks (Admin → server)

const crypto = require('crypto');
const Publication = require('../models/Publication');

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

// Middleware to verify webhook
exports.verifyWebhook = (req, res, next) => {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const digest = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(req.rawBody, 'utf8')
    .digest('base64');

  if (digest !== hmac) {
    return res.status(401).send('Invalid webhook signature');
  }

  next();
};

// @desc    Handle order paid → sync inventory
// @route   POST /api/shopify/webhooks/orders-paid
// @access  Shopify
exports.handleOrderPaid = async (req, res) => {
  try {
    const order = req.body;

    if (!order || !order.line_items) {
      return res.status(400).send('Invalid payload');
    }

    // Optional: sync local DB if needed
    for (const item of order.line_items) {
      await Publication.updateOne(
        { shopifyVariantId: item.variant_id },
        { $inc: { stock: -item.quantity } }
      );
    }

    res.status(200).send('Webhook processed');
  } catch (error) {
    res.status(500).send('Webhook error');
  }
};
