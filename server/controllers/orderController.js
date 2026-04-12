const Order = require('../models/Order');
const Publication = require('../models/Publication');
const stripe = require('../config/stripe');
const dbConnect = require('../config/database');
const { sendEmail } = require('../utils/email');
const generateTrackingNumber = require('../utils/trackingNumber');
const { processOrderFromSession } = require('../services/orderProcessor');

const shippingOptions = [
  { label: 'UK',                value: 5  },
  { label: 'Europe',            value: 8  },
  { label: 'North America',     value: 11 },
  { label: 'South America',     value: 11 },
  { label: 'Rest of the World', value: 13 },
];

const EXTRA_BOOK_SHIPPING = 3; // £3 per book beyond the first
const STICKER_PRICE       = 5; // £5 per sticker pack

/**
 * Mirrors the frontend shipping formula exactly:
 * base fee for the first book + £3 for every additional book
 */
const calculateShippingFee = (baseRate, totalQuantity) => {
  if (totalQuantity <= 0) return 0;
  return baseRate + (totalQuantity - 1) * EXTRA_BOOK_SHIPPING;
};

// @desc    Create Stripe checkout session
// @route   POST /api/orders/create-checkout-session
// @access  Public
exports.createCheckoutSession = async (req, res) => {
  try {
    const {
      items,
      shippingLocation = 'UK',
      stickers = null
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // ── Shipping ────────────────────────────────────────────────────────────
    const shippingOption = shippingOptions.find(
      (o) => o.label.toLowerCase() === shippingLocation.toLowerCase()
    );
    const baseShippingRate = shippingOption ? shippingOption.value : 0;
    const totalQuantity    = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalShippingFee = calculateShippingFee(baseShippingRate, totalQuantity);

    // ── Sticker validation ──────────────────────────────────────────────────
    const stickerQty = stickers?.quantity ?? 0;
    if (stickerQty < 0) {
      return res.status(400).json({ success: false, message: 'Invalid sticker quantity' });
    }
    const stickerTotal = stickerQty * STICKER_PRICE;

    // ── Book line items ─────────────────────────────────────────────────────
    let bookSubtotal = 0;

    const lineItems = await Promise.all(
      items.map(async (item) => {
        const publication = await Publication.findById(item._id);

        if (!publication) {
          throw new Error(`Publication ${item._id} not found`);
        }
        if (publication.stock < (item.quantity || 1)) {
          throw new Error(`Insufficient stock for ${publication.title}`);
        }

        bookSubtotal += publication.price * (item.quantity || 1);

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
          quantity: item.quantity || 1,
        };
      })
    );

    // ── Shipping line item ──────────────────────────────────────────────────
    if (totalShippingFee > 0) {
      const extraBooksLabel = totalQuantity > 1
        ? ` + £${EXTRA_BOOK_SHIPPING} × ${totalQuantity - 1} extra ${totalQuantity - 1 === 1 ? 'book' : 'books'}`
        : '';

      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `Shipping — ${shippingLocation} (${totalQuantity} ${totalQuantity === 1 ? 'book' : 'books'})`,
            description: `Base rate £${baseShippingRate}${extraBooksLabel}`,
          },
          unit_amount: Math.round(totalShippingFee * 100),
        },
        quantity: 1,
      });
    }

    // ── Sticker line item ───────────────────────────────────────────────────
    if (stickerQty > 0) {
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Exclusive Deela stickers',
            description: `Limited edition art stickers — curated add-on for book orders. £${STICKER_PRICE} per pack.`,
            images: [`${process.env.CLIENT_URL}/images/stickers.jpeg`],
            metadata: {
              type:      'sticker_addon',
              unitPrice: STICKER_PRICE.toString(),
              quantity:  stickerQty.toString(),
              total:     stickerTotal.toString(),
            },
          },
          unit_amount: Math.round(STICKER_PRICE * 100),
        },
        quantity: stickerQty,
      });
    }

    // ── Grand total (server-derived — used for webhook verification) ─────────
    const grandTotal = parseFloat(
      (bookSubtotal + totalShippingFee + stickerTotal).toFixed(2)
    );

    // ── Create session ──────────────────────────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.CLIENT_URL}/cart`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'NG'],
      },
      metadata: {
        items:            JSON.stringify(items.map((i) => ({ publicationId: i._id, quantity: i.quantity || 1 }))),
        shippingLocation,
        baseShippingRate: baseShippingRate.toString(),
        totalQuantity:    totalQuantity.toString(),
        totalShippingFee: totalShippingFee.toString(),
        bookSubtotal:     bookSubtotal.toFixed(2),
        stickerQuantity:  stickerQty.toString(),
        stickerUnitPrice: STICKER_PRICE.toString(),
        stickerTotal:     stickerTotal.toFixed(2),
        grandTotal:       grandTotal.toString(),   // ← full server-derived total
      },
    });

    res.json({ success: true, sessionId: session.id, url: session.url });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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


// @desc    Stripe webhook handler
// @route   POST /api/orders/webhook
// @access  Public
exports.handleWebhook = async (req, res) => {
  
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
      await dbConnect();

      const order = await processOrderFromSession(session);

      const customerEmail    = session.customer_details?.email;
      const customerName     = session.customer_details?.name || 'Customer';

      const totalQuantity    = parseInt(session.metadata?.totalQuantity      || '0', 10);

      // ── Shared order variables ───────────────────────────────────────────
      const hasStickers  = (order.stickers?.quantity ?? 0) > 0;
      const hasLine2     = !!(order.shippingAddress?.line2);

      const commonVariables = {
        orderId:          order._id.toString(),
        orderDate:        new Date().toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'long', year: 'numeric',
                          }),
        trackingNumber:   order.trackingNumber || 'Pending',
        totalBooks:       totalQuantity.toString(),
        booksLabel:       totalQuantity === 1 ? 'copy' : 'copies',
        subtotal:         order.subtotal.toFixed(2),
        shippingFee:      order.shippingCost.toFixed(2),
        shippingLocation: order.shippingLocation,
        totalAmount:      order.total.toFixed(2),

        hasStickers: hasStickers
          ? {
              stickerQuantity:  order.stickers.quantity,
              stickerUnitPrice: order.stickers.unitPrice,
              stickerTotal:     order.stickers.total,
            }
          : false,

        // ── Shipping address ─────────────────────────────────────────────────
        shippingLine1:    order.shippingAddress?.line1      || '',
        shippingLine2: hasLine2
          ? { shippingLine2: order.shippingAddress.line2 }
          : false,
        shippingCity:     order.shippingAddress?.city       || '',
        shippingPostcode: order.shippingAddress?.postalCode || '',
        shippingCountry:  order.shippingAddress?.country    || '',
      };

      console.log('Common email variables:', commonVariables); 

      // ── Customer confirmation email ──────────────────────────────────────
      if (customerEmail) {
        sendEmail({
          to:         customerEmail,
          templateId: process.env.ORDER_CONFIRMATION_TEMPLATE_ID,
          variables: {
            ...commonVariables,
            name: customerName,
          },
        }).catch((error) => {
          console.error('❌ Customer email error:', error);
        });
      }

      // ── Admin notification email ─────────────────────────────────────────
      if (process.env.ADMIN_EMAIL) {
        sendEmail({
          to:         process.env.ADMIN_EMAIL,
          templateId: process.env.ADMIN_ORDER_TEMPLATE_ID,
          variables: {
            ...commonVariables,
            customerName,
            customerEmail: customerEmail || 'N/A', 
          },
        }).catch((error) => {
          console.error('❌ Admin email error:', error);
        });
      }

    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      // Return 200 regardless — prevents Stripe from endlessly retrying
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
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.status = status;

    if (status === 'processing') {
      // order.trackingNumber = generateTrackingNumber(); 
    }

    if (status === 'shipped') {
      order.shippedAt = Date.now();
    }

    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }

    await order.save();

    // ── Status emails (non-blocking) ─────────────────────────────────────
    const emailTemplateMap = {
      shipped:   process.env.ORDER_SHIPPED_TEMPLATE_ID,
      delivered: process.env.ORDER_DELIVERED_TEMPLATE_ID,
      cancelled: process.env.ORDER_CANCELLED_TEMPLATE_ID,
    };

    const templateId = emailTemplateMap[status];

    if (templateId && order.email) {
      const hasStickers  = (order.stickers?.quantity ?? 0) > 0;
      const hasLine2     = !!(order.shippingAddress?.line2);

      const shippingVariables = {
        orderId:          order._id.toString(),
        orderNumber:      order.orderNumber,
        orderDate:        new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'long', year: 'numeric',
                          }),
        trackingNumber:   order.trackingNumber || 'Pending',
        totalBooks:       order.items.reduce((sum, i) => sum + i.quantity, 0).toString(),
        booksLabel:       order.items.reduce((sum, i) => sum + i.quantity, 0) === 1 ? 'copy' : 'copies',
        subtotal:         order.subtotal.toFixed(2),
        shippingFee:      order.shippingCost.toFixed(2),
        shippingLocation: order.shippingLocation,
        totalAmount:      order.total.toFixed(2),
        status,

        hasStickers: hasStickers
          ? {
              stickerQuantity:  order.stickers.quantity,
              stickerUnitPrice: order.stickers.unitPrice,
              stickerTotal:     order.stickers.total,
            }
          : false,

        shippingLine1:    order.shippingAddress?.line1      || '',
        shippingLine2:    hasLine2
                            ? { shippingLine2: order.shippingAddress.line2 }
                            : false,
        shippingCity:     order.shippingAddress?.city       || '',
        shippingPostcode: order.shippingAddress?.postalCode || '',
        shippingCountry:  order.shippingAddress?.country    || '',

        // Shipped-specific
        shippedAt:    status === 'shipped'
                        ? new Date().toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'long', year: 'numeric',
                          })
                        : '',
        // Delivered-specific
        deliveredAt:  status === 'delivered'
                        ? new Date().toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'long', year: 'numeric',
                          })
                        : '',
      };

      sendEmail({
        to:         order.email,
        templateId,
        variables:  shippingVariables,
      }).catch((err) => console.error(`❌ ${status} email error:`, err));
    }

    res.json({
      success: true,
      data: order,
    });

  } catch (error) {
    console.error('❌ Update order status error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating order',
      error:   error.message,
    });
  }
};