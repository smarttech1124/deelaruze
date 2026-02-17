const Order = require('../models/Order');
const Publication = require('../models/Publication');
const stripe = require('../config/stripe');
const dbConnect = require('../config/database');
const { sendEmail } = require('../utils/email');
const { processOrderFromSession } = require('../services/orderProcessor');

const shippingOptions = [
  { label: 'UK', value: 8 },
  { label: 'Europe', value: 8 },
  { label: 'North America', value: 11 },
  { label: 'South America', value: 11 },
  { label: 'Rest of the World', value: 13 },
];


// @desc    Create Stripe checkout session
// @route   POST /api/orders/create-checkout-session
// @access  Public
exports.createCheckoutSession = async (req, res) => {
  try {
    const { items, shippinglocation = 'UK' } = req.body;

    const shippingOption = shippingOptions.find(
      (option) => option.label.toLowerCase() === shippinglocation.toLowerCase()
    );

    const shippingfee = shippingOption ? shippingOption.value : 0; 

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    const lineItems = await Promise.all(
      items.map(async (item) => {
        const publication = await Publication.findById(item._id);

        if (!publication) {
          throw new Error(`Publication ${item._id} not found`);
        }

        if (publication.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${publication.title}`);
        }

        return {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: publication.title,
              description: publication.description.replace(/<[^>]*>?/gm, ''),
              images: [publication.images[0]?.url],
            },
            unit_amount: Math.round(publication.price * 100),
          },
          quantity: item.quantity,
        };
      })
    );

    // shipping fee
    if (shippingfee > 0) {
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `Shipping Fee (${shippinglocation})`,
          },
          unit_amount: Math.round(shippingfee * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      shipping_address_collection: {
        allowed_countries: ['US','CA','GB','AU','DE','FR','ES','IT','NL','NG'],
      },
      metadata: {
        items: JSON.stringify(
          items.map(i => ({
            publicationId: i._id,
            quantity: i.quantity,
          }))
        ),
        shippingFee: shippingfee.toString(),
      },
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// @desc    Verify Stripe checkout session
// @route   GET /api/orders/verify-session
// @access  Public
exports.verifyCheckoutSession = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: 'Session ID required',
      });
    }

    const order = await Order.findOne({
      stripeSessionId: session_id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not ready yet. Please refresh.',
      });
    }

    res.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      email: order.email,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Verification failed',
    });
  }
};
;

// @desc    Stripe webhook handler
// @route   POST /api/orders/webhook
// @access  Public
exports.handleWebhook = async (req, res) => {
  await dbConnect();

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const order = await processOrderFromSession(session);

      await sendEmail({
        to: order.email,
        subject: `Order Confirmation #${order.orderNumber}`,
        text: `Thank you for your purchase!

            Order: ${order.orderNumber}
            Total: $${order.total.toFixed(2)}

            We'll notify you when it ships.`,
      });

    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  }

  res.json({ received: true });
};


// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('items.publication', 'title images');

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { status, sort = '-createdAt', limit = 100 } = req.query;

    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .populate('items.publication', 'title images');

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'items.publication',
      'title images description'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.status = status;
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (status === 'shipped') {
      order.shippedAt = Date.now();
      
      // Send shipping email
      await sendEmail({
        to: order.email,
        subject: `Your Order Has Shipped #${order.orderNumber} - Deelaruze`,
        text: `Your order has been shipped!\n\nOrder Number: ${order.orderNumber}\nTracking Number: ${trackingNumber || 'N/A'}\n\nDeelaruze Team`,
      });
    } else if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating order',
      error: error.message,
    });
  }
};