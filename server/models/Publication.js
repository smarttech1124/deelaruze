const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 100 characters'],
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [200, 'Tagline cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    pages: {
      type: Number,
      required: [true, 'Pages is required'],
      min: [0, 'Price cannot be negative'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],
    contributors: {
      type: String,
      trim: true,
      required: [true, 'Contributors is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'published'], 
      default: 'available',
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    category: {
      type: String,
      // enum: ['zine', 'sticker pack', 'volume', 'special edition'],
      // required: [true, 'Category is required'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      unique: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    sales: {
      type: Number,
      default: 0, 
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug before saving
publicationSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Update status based on stock
publicationSchema.pre('save', function (next) {
  if (this.stock === 0 && this.status === 'available') {
    this.status = 'sold out';
  }
  next();
});

module.exports = mongoose.model('Publication', publicationSchema);