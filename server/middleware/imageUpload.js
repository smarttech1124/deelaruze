const multer = require('multer');

// Memory storage — buffers are streamed straight to Cloudinary, nothing hits disk.
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error('Only JPG, PNG, WEBP or GIF image files are allowed'), false);
};

/**
 * Shared image upload middleware factory.
 * Mirrors the limits/validation used by the existing publication + street uploads.
 */
const imageUpload = (options = {}) =>
  multer({
    storage,
    limits: {
      fileSize: options.fileSize || 10 * 1024 * 1024, // 10MB
      files: options.files || 20,
    },
    fileFilter,
  });

module.exports = imageUpload;
module.exports.ALLOWED_MIME_TYPES = ALLOWED_MIME_TYPES;
