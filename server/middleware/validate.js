const { body, param, query, validationResult } = require('express-validator');
const { ErrorResponse } = require('./errorHandler');

// Validation result checker
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return next(new ErrorResponse(errorMessages.join(', '), 400));
  }
  
  next();
};

// About validation rules
exports.validateAbout = [
  body('about')
    .trim()
    .notEmpty()
    .withMessage('About is required')
    .isLength({ min: 10 })
    .withMessage('About must be at least 10 characters'),
  
  validate,
];

// Publication validation rules
exports.validatePublication = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  
  body('tagline')
    .trim()
    .notEmpty()
    .isLength({ max: 200 })
    .withMessage('Subtitle must not exceed 200 characters'),

  body('pages')
    .trim()
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage('Subtitle must not exceed 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  // body('category')
  //   .exists({ checkFalsy: true })
  //   .withMessage('Category is required')
  //   .bail()
  //   .isIn(['sticker pack', 'volume', 'special edition'])
  //   .withMessage('Invalid category'),
  
  body('stock')
    .notEmpty()
    // .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'), 
  
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Invalid status'),
  
  validate,
];

// Submission validation rules
exports.validateSubmission = [
  body('artistName')
    .trim()
    .notEmpty()
    .withMessage('Artist name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Artist name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('instagram')
    .optional()
    .trim()
    .matches(/^@?[\w.]+$/)
    .withMessage('Invalid Instagram handle'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
  
  validate,
];

// Contact form validation rules
exports.validateContact = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  
  validate,
];

// Newsletter subscription validation
exports.validateNewsletter = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  validate,
];

// Order validation rules
exports.validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('items.*.publication')
    .notEmpty()
    .withMessage('Publication ID is required')
    .isMongoId()
    .withMessage('Invalid publication ID'),
  
  body('items.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  
  validate,
];

// User registration validation
exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  validate,
];

// User login validation
exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate,
];

// MongoDB ObjectId validation
exports.validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  validate,
];

// Pagination validation
exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  validate,
];

// Sort validation
exports.validateSort = [
  query('sort')
    .optional()
    .matches(/^-?[\w]+$/)
    .withMessage('Invalid sort parameter'),
  
  validate,
];

// Status update validation
exports.validateStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'reviewing', 'approved', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  
  validate,
];

// From the Street publication validation
exports.validateFromTheStreet = [
  body('artistName')
    .trim()
    .notEmpty()
    .withMessage('Artist name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Artist name must be between 2 and 100 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
];

// Custom sanitization middleware
exports.sanitizeInput = (req, res, next) => {
  // Remove any potential XSS from body
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        // Remove script tags and dangerous characters
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }
  
  next();
};

// Rate limit check for sensitive operations
exports.checkRateLimit = (maxRequests = 5, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const identifier = req.ip || req.headers['x-forwarded-for'];
    const now = Date.now();
    
    if (!requests.has(identifier)) {
      requests.set(identifier, []);
    }

    const userRequests = requests.get(identifier);
    const recentRequests = userRequests.filter(
      (timestamp) => now - timestamp < windowMs
    );

    if (recentRequests.length >= maxRequests) {
      return next(
        new ErrorResponse(
          'Too many requests. Please try again later',
          429
        )
      );
    }

    recentRequests.push(now);
    requests.set(identifier, recentRequests);

    // Clean up old entries
    if (requests.size > 10000) {
      const oldestKey = requests.keys().next().value;
      requests.delete(oldestKey);
    }

    next();
  };
};

// Validate email format
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate URL format
exports.isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Validate Instagram handle
exports.isValidInstagram = (handle) => {
  const instagramRegex = /^@?[\w.]+$/;
  return instagramRegex.test(handle);
};

module.exports.validate = validate;
// ── Admin-managed content types ─────────────────────────────────────────────

// Roaring Records validation rules
exports.validateRoaringRecord = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Record name is required')
    .isLength({ max: 200 })
    .withMessage('Record name must not exceed 200 characters'),

  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Subtitle must not exceed 300 characters'),

  body('description')
    .optional()
    .trim(),

  body('mediaUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Media link must be a full URL starting with http:// or https://'),

  body('mediaLabel')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 60 })
    .withMessage('Button text must not exceed 60 characters'),

  body('status')
    .optional({ checkFalsy: true })
    .isIn(['draft', 'published'])
    .withMessage('Invalid status'),

  validate,
];

// Sticker validation rules
exports.validateSticker = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Sticker name must not exceed 200 characters'),

  body('status')
    .optional({ checkFalsy: true })
    .isIn(['draft', 'published'])
    .withMessage('Invalid status'),

  validate,
];

// Collaboration validation rules
exports.validateCollaboration = [
  body('collaborator')
    .trim()
    .notEmpty()
    .withMessage('Collaborator name is required')
    .isLength({ max: 200 })
    .withMessage('Collaborator name must not exceed 200 characters'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  body('status')
    .optional({ checkFalsy: true })
    .isIn(['draft', 'published'])
    .withMessage('Invalid status'),

  validate,
];

// Hero slide validation rules
exports.validateHeroSlide = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Title must not exceed 300 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('accent')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .withMessage('Accent must be a hex colour, e.g. #FF3366'),

  body('placement')
    .optional({ checkFalsy: true })
    .isIn(['center', 'top', 'bottom', 'left', 'right'])
    .withMessage('Invalid image placement'),

  body('textPlacement')
    .optional({ checkFalsy: true })
    .isIn(['center', 'top', 'bottom', 'left', 'right'])
    .withMessage('Invalid text placement'),

  body('status')
    .optional({ checkFalsy: true })
    .isIn(['draft', 'published'])
    .withMessage('Invalid status'),

  validate,
];

// Page-level content validation rules
exports.validatePageContent = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),

  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Subtitle must not exceed 300 characters'),

  validate,
];
