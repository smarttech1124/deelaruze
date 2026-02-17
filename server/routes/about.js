const express = require('express');
const router = express.Router();
const {
  saveAbout,
  getAbout,
} = require('../controllers/aboutDeelaruzeController');
const { protect, authorize } = require('../middleware/auth');
const { validateAbout } = require('../middleware/validate');

// Public routes
router.get('/', getAbout);

// Protected routes (would need auth middleware)
router.post('/', protect, authorize('admin'), validateAbout, saveAbout);

module.exports = router;