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
  uploadImages,
} = require('../controllers/publicationController');
const { protect, authorize } = require('../middleware/auth');
const { validatePublication } = require('../middleware/validate');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  },
});

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
  // upload.array('images', 10), 
  validatePublication, 
  createPublication
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  // upload.array('images', 10),  
  validatePublication, 
  updatePublication
);

router.delete(
  '/:id', 
  protect, 
  authorize('admin'), 
  deletePublication
);

// router.post('/:id/images', protect, authorize('admin'), upload.array('images', 10), uploadImages);

module.exports = router;