const mongoose = require('mongoose');
const dbConnect  = require('../config/database');
const Order = require('../models/Order');
const Publication = require('../models/Publication');
const generateOrderNumber = require('../utils/trackingNumber');

const processOrderFromSession = async (stripeSession) => {

  await dbConnect();

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  // console.log(`Processing Stripe session:  ${JSON.stringify(stripeSession)}`);

  try {
    // ── Idempotency guard ──────────────────────────────────────────────────
    const existingOrder = await Order.findOne({
      stripeSessionId: stripeSession.id,
    }).session(dbSession);

    if (existingOrder) {
      await dbSession.commitTransaction();
      dbSession.endSession();
      return existingOrder;
    }

    // ── Parse metadata ─────────────────────────────────────────────────────
    const metadataItems  = JSON.parse(stripeSession.metadata.items || '[]');
    const shippingLocation = stripeSession.metadata?.shippingLocation
      || stripeSession.customer_details?.address?.country
      || '';

    // Shipping — stored as totalShippingFee in createCheckoutSession
    const shippingCost = parseFloat(stripeSession.metadata?.totalShippingFee || '0');

    // Stickers — all three fields written by createCheckoutSession
    const stickerQty       = parseInt(stripeSession.metadata?.stickerQuantity  || '0', 10);
    const stickerUnitPrice = parseFloat(stripeSession.metadata?.stickerUnitPrice || '0');
    const stickerTotal     = parseFloat(stripeSession.metadata?.stickerTotal    || '0');

    // ── Book items + stock deduction ───────────────────────────────────────
    let bookSubtotal = 0;
    const orderItems = [];

    for (const item of metadataItems) {
      const publication = await Publication.findById(item.publicationId)
        .session(dbSession);

      if (!publication) {
        throw new Error(`Publication ${item.publicationId} not found`);
      }
      if (publication.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${publication.title}`);
      }

      // Atomic stock + sales update
      publication.stock  -= item.quantity;
      publication.sales   = (publication.sales || 0) + item.quantity;
      await publication.save({ session: dbSession });

      bookSubtotal += publication.price * item.quantity;

      orderItems.push({
        publication: publication._id,
        title:       publication.title,
        price:       publication.price,
        quantity:    item.quantity,
        image:       publication.images?.[0]?.url || '',
      });
    }

    // ── Totals ─────────────────────────────────────────────────────────────
    // Use Stripe's verified amount_total as the source of truth for total
    const total = stripeSession.amount_total / 100;

    // Cross-check: server-derived vs Stripe-collected (log discrepancies)
    const serverDerivedTotal = parseFloat(stripeSession.metadata?.grandTotal || '0');
    if (serverDerivedTotal && Math.abs(total - serverDerivedTotal) > 0.01) {
      console.warn(
        `⚠️  Total mismatch on session ${stripeSession.id}: ` +
        `Stripe £${total} vs metadata £${serverDerivedTotal}`
      );
    }

    // ── Create order ───────────────────────────────────────────────────────
    const order = await Order.create(
      [
        {
          email:    stripeSession.customer_details.email,
          phone:    stripeSession.metadata?.postalNumber || 'N/A',
          items:    orderItems,

          stickers: {
            quantity:  stickerQty,
            unitPrice: stickerUnitPrice,
            total:     stickerTotal,
          },

          subtotal:         bookSubtotal,
          shippingCost,
          shippingLocation,
          tax:              0,
          total,
          paymentStatus:    'completed',
          orderNumber:   generateOrderNumber(),

          stripeSessionId:       stripeSession.id,
          stripePaymentIntentId: stripeSession.payment_intent,

          shippingAddress: {
            name:       stripeSession.collected_information?.shipping_details?.name,
            line1:      stripeSession.collected_information?.shipping_details?.address?.line1,
            line2:      stripeSession.collected_information?.shipping_details?.address?.line2, 
            city:       stripeSession.collected_information?.shipping_details?.address?.city,
            state:      stripeSession.collected_information?.shipping_details?.address?.state,
            postalCode: stripeSession.collected_information?.shipping_details?.address?.postal_code,
            country:    stripeSession.collected_information?.shipping_details?.address?.country,
          },
        },
      ],
      { session: dbSession }
    );

    await dbSession.commitTransaction();
    dbSession.endSession();

    return order[0];

  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    throw error;
  }
};

module.exports = { processOrderFromSession };