const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
  getAllPublications,
  getPublication,
  getPublicationBySlug,
  getFeaturedPublications,
  createPublication,
  updatePublication,
  deletePublication,
} = require('../controllers/publicationController');

const { protect, authorize } = require('../middleware/auth');
const { validatePublication } = require('../middleware/validate');

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
router.get('/', getAllPublications);
router.get('/featured', getFeaturedPublications);
router.get('/slug/:slug', getPublicationBySlug);
router.get('/:id', getPublication);

// Protected routes (admin only)
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.array('images', 10),
  validatePublication,
  createPublication
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  upload.array('images', 10),
  validatePublication,
  updatePublication
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deletePublication
);

module.exports = router;
