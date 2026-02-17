const mongoose = require('mongoose');
const Order = require('../models/Order');
const Publication = require('../models/Publication');

const processOrderFromSession = async (stripeSession) => {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction(); 

  try {
    // Idempotency check
    const existingOrder = await Order.findOne({
      stripeSessionId: stripeSession.id,
    }).session(dbSession);

    if (existingOrder) {
      await dbSession.commitTransaction();
      dbSession.endSession();
      return existingOrder;
    }

    const metadataItems = JSON.parse(stripeSession.metadata.items || '[]');
    // const shippingFee = Number(stripeSession.metadata.shippingFee || 0);
    const shippingFee = stripeSession.metadata?.shippingFee;
    const shippingLocation = stripeSession.metadata?.shippingLocation;

    let subtotal = 0;
    const orderItems = [];

    for (const item of metadataItems) {
      const publication = await Publication.findById(item.publicationId)
        .session(dbSession);

      if (!publication) {
        throw new Error('Publication not found');
      }

      if (publication.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${publication.title}`);
      }

      // Atomic stock + sales update
      publication.stock -= item.quantity;
      publication.sales = (publication.sales || 0) + item.quantity;
      await publication.save({ session: dbSession });

      subtotal += publication.price * item.quantity;

      orderItems.push({
        publication: publication._id,
        title: publication.title,
        price: publication.price,
        quantity: item.quantity,
        image: publication.images?.[0]?.url || '',
      });
    }

    const total = stripeSession.amount_total / 100;

    const order = await Order.create([{
      email: stripeSession.customer_details.email,
      items: orderItems,
      subtotal,
      shippingCost: shippingFee,
      shippingLocation: shippingLocation,
      tax: 0,
      total,
      paymentStatus: 'completed',
      stripeSessionId: stripeSession.id,
      stripePaymentIntentId: stripeSession.payment_intent,
      shippingAddress: {
        name: stripeSession.customer_details.name,
        line1: stripeSession.customer_details.address?.line1,
        line2: stripeSession.customer_details.address?.line2,
        city: stripeSession.customer_details.address?.city,
        state: stripeSession.customer_details.address?.state,
        postalCode: stripeSession.customer_details.address?.postal_code,
        country: stripeSession.customer_details.address?.country,
      },
    }], { session: dbSession });

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
