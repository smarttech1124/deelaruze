const Submission = require('../models/Submission');
const cloudinary = require('../config/cloudinary');
const { sendEmail } = require('../utils/email');

// @desc    Create submission
// @route   POST /api/submissions
// @access  Public
exports.createSubmission = async (req, res) => {
  try {
    const { artistName, email, instagram, description } = req.body;

    // Upload images to Cloudinary
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'deelaruze/submissions',
          transformation: [
            { width: 2000, height: 2000, crop: 'limit' },
            { quality: 'auto' },
          ],
        });

        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    const submission = await Submission.create({
      artistName,
      email,
      instagram,
      description,
      images: uploadedImages,
    });

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: 'Submission Received - Deelaruze',
      text: `Hi ${artistName},\n\nWe've received your submission and will review it within 2-3 weeks. We'll be in touch soon!\n\nDeelaruze Team`,
    });

    res.status(201).json({
      success: true,
      message: 'Submission received successfully',
      data: submission,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating submission',
      error: error.message,
    });
  }
};

// @desc    Get all submissions
// @route   GET /api/submissions
// @access  Private/Admin
exports.getAllSubmissions = async (req, res) => {
  try {
    const { status, sort = '-createdAt', limit = 50 } = req.query;

    const query = status ? { status } : {};

    const submissions = await Submission.find(query)
      .sort(sort)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message,
    });
  }
};

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private/Admin
exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching submission',
      error: error.message,
    });
  }
};

// @desc    Update submission status
// @route   PUT /api/submissions/:id/status
// @access  Private/Admin
exports.updateSubmissionStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    submission.status = status;
    submission.notes = notes;
    submission.reviewedAt = Date.now();
    submission.reviewedBy = req.user?._id;

    await submission.save();

    // Send status update email
    let emailSubject = '';
    let emailText = '';

    if (status === 'approved') {
      emailSubject = 'Your Submission Was Approved! - Deelaruze';
      emailText = `Hi ${submission.artistName},\n\nGreat news! Your submission has been approved. We'll be in touch soon to discuss next steps.\n\nDeelaruze Team`;
    } else if (status === 'rejected') {
      emailSubject = 'Submission Update - Deelaruze';
      emailText = `Hi ${submission.artistName},\n\nThank you for your submission. Unfortunately, it doesn't fit our current publication plans. We encourage you to submit again in the future!\n\nDeelaruze Team`;
    }

    if (emailSubject) {
      await sendEmail({
        to: submission.email,
        subject: emailSubject,
        text: emailText,
      });
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating submission',
      error: error.message,
    });
  }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private/Admin
exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Delete images from Cloudinary
    for (const image of submission.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    await submission.deleteOne();

    res.json({
      success: true,
      message: 'Submission deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting submission',
      error: error.message,
    });
  }
};