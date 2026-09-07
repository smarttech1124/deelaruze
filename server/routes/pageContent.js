const express = require('express');
const router = express.Router();

const {
  getAllPageContent,
  getPageContent,
  savePageContent,
} = require('../controllers/pageContentController');

const { protect, authorize } = require('../middleware/auth');
const { validatePageContent } = require('../middleware/validate');
const imageUpload = require('../middleware/imageUpload');

const upload = imageUpload().fields([{ name: 'image', maxCount: 1 }]);

// Public routes
router.get('/', getAllPageContent);
router.get('/:slug', getPageContent);

// Protected routes (admin only)
router.put(
  '/:slug',
  protect,
  authorize('admin'),
  upload,
  validatePageContent,
  savePageContent
);

module.exports = router;
