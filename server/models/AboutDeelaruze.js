const mongoose = require('mongoose');

const aboutDeelaruzeSchema = new mongoose.Schema(
  {
    about: {
      type: String,
      required: [true, 'About profile is required'],
      trim: true,
    },    
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AboutDeelaruze', aboutDeelaruzeSchema);