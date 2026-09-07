const mongoose = require('mongoose');

const collaborationSchema = new mongoose.Schema(
  {
    collaborator: {
      type: String,
      required: [true, 'Collaborator name is required'],
      trim: true,
      maxlength: [200, 'Collaborator name cannot exceed 200 characters'],
    },
    title: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    link: {
      type: String,
      trim: true,
      default: '',
    },
    // Between 1 and 5 artworks per collaboration; the first is the cover.
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        alt: { type: String, default: '' },
      },
    ],
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

collaborationSchema.index({ order: 1 });

module.exports = mongoose.model('Collaboration', collaborationSchema);
