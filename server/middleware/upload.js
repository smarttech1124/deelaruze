const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ErrorResponse } = require('./errorHandler');

// Ensure upload directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage - Multer 2.x compatible
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
    
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images only
const imageFileFilter = (req, file, cb) => {
  // Allowed image types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(
      new ErrorResponse(
        'Only image files are allowed (jpeg, jpg, png, gif, webp)',
        400
      )
    );
  }
};

// File filter for any file type
const anyFileFilter = (req, file, cb) => {
  cb(null, true);
};

// Base upload configuration
const uploadConfig = {
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10, // Maximum 10 files
  },
};

// Upload middleware for single image
exports.uploadSingleImage = multer({
  ...uploadConfig,
  fileFilter: imageFileFilter,
}).single('image');

// Upload middleware for multiple images
exports.uploadMultipleImages = multer({
  ...uploadConfig,
  fileFilter: imageFileFilter,
}).array('images', 10);

// Upload middleware for publication images
exports.uploadPublicationImages = multer({
  ...uploadConfig,
  fileFilter: imageFileFilter,
}).array('images', 10);

// Upload middleware for submission images
exports.uploadSubmissionImages = multer({
  ...uploadConfig,
  fileFilter: imageFileFilter,
}).array('images', 10);

// Upload middleware for any file type
exports.uploadAnyFile = multer({
  ...uploadConfig,
  fileFilter: anyFileFilter,
}).single('file');

// Upload middleware for multiple files of any type
exports.uploadMultipleFiles = multer({
  ...uploadConfig,
  fileFilter: anyFileFilter,
}).array('files', 10);

// Custom upload with field names
exports.uploadFields = (fields) => {
  return multer({
    ...uploadConfig,
    fileFilter: imageFileFilter,
  }).fields(fields);
};

// Cleanup uploaded files on error
exports.cleanupFiles = (files) => {
  if (!files) return;

  const fileArray = Array.isArray(files) ? files : [files];

  fileArray.forEach((file) => {
    if (file.path && fs.existsSync(file.path)) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        }
      });
    }
  });
};

// Middleware to cleanup files on error
exports.cleanupOnError = (err, req, res, next) => {
  if (err) {
    // Clean up uploaded files if there's an error
    if (req.file) {
      exports.cleanupFiles(req.file);
    }
    if (req.files) {
      exports.cleanupFiles(req.files);
    }
  }
  next(err);
};

// Validate file size
exports.validateFileSize = (maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    if (req.file && req.file.size > maxSize) {
      exports.cleanupFiles(req.file);
      return next(
        new ErrorResponse(
          `File size too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
          400
        )
      );
    }

    if (req.files) {
      const oversizedFiles = req.files.filter((file) => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        exports.cleanupFiles(req.files);
        return next(
          new ErrorResponse(
            `File size too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
            400
          )
        );
      }
    }

    next();
  };
};

// Validate file count
exports.validateFileCount = (minCount = 1, maxCount = 10) => {
  return (req, res, next) => {
    const fileCount = req.files ? req.files.length : req.file ? 1 : 0;

    if (fileCount < minCount) {
      return next(
        new ErrorResponse(
          `Please upload at least ${minCount} file(s)`,
          400
        )
      );
    }

    if (fileCount > maxCount) {
      exports.cleanupFiles(req.files);
      return next(
        new ErrorResponse(
          `Maximum ${maxCount} files allowed`,
          400
        )
      );
    }

    next();
  };
};

// Validate image dimensions (requires sharp package)
exports.validateImageDimensions = (minWidth, minHeight, maxWidth, maxHeight) => {
  return async (req, res, next) => {
    try {
      // This would require the sharp package
      // npm install sharp
      const sharp = require('sharp');

      const files = req.files || (req.file ? [req.file] : []);

      for (const file of files) {
        const metadata = await sharp(file.path).metadata();

        if (minWidth && metadata.width < minWidth) {
          exports.cleanupFiles(files);
          return next(
            new ErrorResponse(
              `Image width must be at least ${minWidth}px`,
              400
            )
          );
        }

        if (minHeight && metadata.height < minHeight) {
          exports.cleanupFiles(files);
          return next(
            new ErrorResponse(
              `Image height must be at least ${minHeight}px`,
              400
            )
          );
        }

        if (maxWidth && metadata.width > maxWidth) {
          exports.cleanupFiles(files);
          return next(
            new ErrorResponse(
              `Image width must not exceed ${maxWidth}px`,
              400
            )
          );
        }

        if (maxHeight && metadata.height > maxHeight) {
          exports.cleanupFiles(files);
          return next(
            new ErrorResponse(
              `Image height must not exceed ${maxHeight}px`,
              400
            )
          );
        }
      }

      next();
    } catch (error) {
      exports.cleanupFiles(req.files || req.file);
      next(new ErrorResponse('Error validating image dimensions', 400));
    }
  };
};