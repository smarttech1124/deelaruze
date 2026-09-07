const mongoose = require('mongoose');

const stickerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Sticker name cannot exceed 200 characters'],
    },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      alt: { type: String, default: '' },
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

stickerSchema.index({ order: 1 });

module.exports = mongoose.model('Sticker', stickerSchema);
