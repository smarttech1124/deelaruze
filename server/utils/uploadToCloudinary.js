const cloudinary = require('../config/cloudinary');

const DEFAULT_TRANSFORMATION = [
  { width: 1200, height: 1500, crop: 'limit' },
  { quality: 'auto' },
  { fetch_format: 'auto' },
];

/**
 * Streams a buffer to Cloudinary.
 *
 * @param {Buffer} buffer      raw file buffer (multer memory storage)
 * @param {string} folder      cloudinary folder
 * @param {Object} [options]   { transformation } to override the default sizing
 */
const uploadToCloudinary = (buffer, folder = 'deelaruze/publications', options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        transformation: options.transformation || DEFAULT_TRANSFORMATION,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

module.exports = uploadToCloudinary;
module.exports.DEFAULT_TRANSFORMATION = DEFAULT_TRANSFORMATION;
