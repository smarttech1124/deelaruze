const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
  getFromTheStreet,
  getFromTheStreetById,
  createFromTheStreet,
  updateFromTheStreet,
  deleteFromTheStreet,
} = require('../controllers/fromTheStreetController');

const { protect, authorize } = require('../middleware/auth');
const { validateFromTheStreet } = require('../middleware/validate');

// ✅ Configure multer to use memory storage (NO disk saving)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Public routes
router.get('/', getFromTheStreet);
router.get('/:id', getFromTheStreetById);

// Protected routes (admin only)
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.array('images', 10),
  validateFromTheStreet,
  createFromTheStreet
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  upload.array('images', 10),
  validateFromTheStreet,
  updateFromTheStreet
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteFromTheStreet
);

module.exports = router;
