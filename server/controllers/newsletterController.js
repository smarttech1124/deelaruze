const Newsletter = require('../models/Newsletter');
const { sendEmail } = require('../utils/email');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });

    if (existing) {
      if (existing.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'Email already subscribed',
        });
      }
      
      // Reactivate subscription
      existing.status = 'active';
      existing.unsubscribedAt = null;
      await existing.save();

      await sendEmail({
        to: email,
        subject: 'Welcome Back - Deelaruze Newsletter',
        text: 'You\'re back on our list! We\'ll keep you updated on new drops and artist features.',
      });

      return res.json({
        success: true,
        message: 'Subscription reactivated',
        data: existing,
      });
    }

    // Create new subscription
    const subscriber = await Newsletter.create({ email });

    await sendEmail({
      to: email,
      subject: 'Welcome to Deelaruze',
      text: 'Thanks for subscribing! You\'ll be the first to know about new drops, artist features, and underground happenings.',
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed',
      data: subscriber,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error subscribing',
      error: error.message,
    });
  }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    const subscriber = await Newsletter.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
      });
    }

    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = Date.now();
    await subscriber.save();

    res.json({
      success: true,
      message: 'Successfully unsubscribed',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error unsubscribing',
      error: error.message,
    });
  }
};

// @desc    Get all subscribers
// @route   GET /api/newsletter
// @access  Private/Admin
exports.getAllSubscribers = async (req, res) => {
  try {
    const { status = 'active', sort = '-createdAt' } = req.query;

    const subscribers = await Newsletter.find({ status }).sort(sort);

    res.json({
      success: true,
      count: subscribers.length,
      data: subscribers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscribers',
      error: error.message,
    });
  }
};