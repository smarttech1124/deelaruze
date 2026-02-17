const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'deelaruze/publications',
        transformation: [
          { width: 1200, height: 1500, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer); // 🔥 REQUIRED
  });
};

module.exports = uploadToCloudinary;
