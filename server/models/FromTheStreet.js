const mongoose = require('mongoose');

const fromTheStreetSchema = new mongoose.Schema(
  {
    artist: {
        type: String,
        required: [true, 'Artist is required'],
        trim: true,
        maxlength: [200, 'Artist cannot exceed 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
        maxlength: [200, 'Location cannot exceed 100 characters'],
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
    
    status: {
      type: String,
      enum: ['draft', 'published'], 
      default: 'available',
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FromTheStreet', fromTheStreetSchema);