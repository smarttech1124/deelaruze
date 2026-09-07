const mongoose = require('mongoose');

const roaringRecordSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Record name is required'],
      trim: true,
      maxlength: [200, 'Record name cannot exceed 200 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Subtitle cannot exceed 300 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      alt: { type: String, default: '' },
    },
    // Optional audio/video link played inline on the Roaring Records page.
    mediaUrl: {
      type: String,
      trim: true,
      default: '',
    },
    mediaLabel: {
      type: String,
      trim: true,
      default: '',
      maxlength: [60, 'Button text cannot exceed 60 characters'],
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

roaringRecordSchema.index({ order: 1 });

module.exports = mongoose.model('RoaringRecord', roaringRecordSchema);
