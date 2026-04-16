const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    items: [
      {
        publication: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Publication',
          required: true,
        },
        title:      String,
        price:      Number,
        quantity:   { type: Number, required: true, min: 1 },
        image:      String,
        shippingFee: Number,
      },
    ],

    // ── Sticker add-on (optional) ──────────────────────────────────────────
    stickers: {
      quantity:   { type: Number, default: 0 },
      unitPrice:  { type: Number, default: 0 },
      total:      { type: Number, default: 0 },
    },

    shippingAddress: {
      name:       String,
      line1:      String,
      line2:      String,
      city:       String,
      state:      String,
      postalCode: String,
      country:    String,
    },

    subtotal:         { type: Number, required: true },
    shippingCost:     { type: Number, default: 0 },
    shippingLocation: { type: String },
    tax:              { type: Number, default: 0 },
    total:            { type: Number, required: true },

    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },

    stripeSessionId:       { type: String },
    stripePaymentIntentId: { type: String },
    trackingNumber:        { type: String },
    shippedAt:             { type: Date },
    deliveredAt:           { type: Date },
  },
  { timestamps: true }
);

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    this.orderNumber = `DLZ-${randomNum}`; 
  }
  next();
});

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ email: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);