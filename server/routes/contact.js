const express = require('express');
const router = express.Router();
const {
  sendContactMessage,
  getAllMessages,
  markAsRead,
  deleteMessage,
} = require('../controllers/contactController');

// Public routes
router.post('/', sendContactMessage);

// Protected routes (would need auth middleware)
router.get('/', getAllMessages);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteMessage);

module.exports = router;