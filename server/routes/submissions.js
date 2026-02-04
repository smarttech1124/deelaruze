const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createSubmission,
  getAllSubmissions,
  getSubmission,
  updateSubmissionStatus,
  deleteSubmission,
} = require('../controllers/submissionController');

// Configure multer
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
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  },
});

// Public routes
router.post('/', upload.array('images', 10), createSubmission);

// Protected routes (would need auth middleware)
router.get('/', getAllSubmissions);
router.get('/:id', getSubmission);
router.put('/:id/status', updateSubmissionStatus);
router.delete('/:id', deleteSubmission);

module.exports = router;