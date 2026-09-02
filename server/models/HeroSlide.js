const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    // Desktop / default artwork
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      alt: { type: String, default: '' },
    },
    // Optional portrait crop served on small screens
    mobileImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    accent: {
      type: String,
      trim: true,
      default: '#FF3366',
    },
    // CSS background-position used to control cropping
    position: {
      type: String,
      trim: true,
      default: 'center center',
    },
    // Deprecated: superseded by textPlacement. Kept so slides created before
    // the split keep their original text position.
    placement: {
      type: String,
      enum: ['center', 'top', 'bottom', 'left', 'right'],
      default: 'center',
    },
    // Where the slide text sits within the frame
    textPlacement: {
      type: String,
      enum: ['center', 'top', 'bottom', 'left', 'right'],
      default: 'center',
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

heroSlideSchema.index({ order: 1 });

module.exports = mongoose.model('HeroSlide', heroSlideSchema);
