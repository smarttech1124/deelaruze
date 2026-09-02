const PageContent = require('../models/PageContent');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const { TRANSFORMATIONS, destroyImage, fileFor } = require('../utils/contentCrud');

// Slugs the admin portal is allowed to manage.
const ALLOWED_SLUGS = ['roaring-records', 'stickers', 'collaborations'];

exports.ALLOWED_SLUGS = ALLOWED_SLUGS;

// @desc    Get every page content block
// @route   GET /api/page-content
// @access  Public
exports.getAllPageContent = async (req, res) => {
  try {
    const pages = await PageContent.find();

    res.json({ success: true, count: pages.length, data: pages });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching page content',
      error: error.message,
    });
  }
};

// @desc    Get a single page's content block
// @route   GET /api/page-content/:slug
// @access  Public
exports.getPageContent = async (req, res) => {
  try {
    const page = await PageContent.findOne({ slug: req.params.slug.toLowerCase() });

    // An unconfigured page is not an error — the frontend falls back to defaults.
    res.json({ success: true, data: page || null });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching page content',
      error: error.message,
    });
  }
};

// @desc    Create or update a page's content block
// @route   PUT /api/page-content/:slug
// @access  Private/Admin
exports.savePageContent = async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();

    if (!ALLOWED_SLUGS.includes(slug)) {
      return res.status(400).json({
        success: false,
        message: 'Unknown page: ' + slug,
      });
    }

    const existing = await PageContent.findOne({ slug });
    const updateData = { ...req.body, slug };

    const file = fileFor(req, 'image');

    if (file) {
      const result = await uploadToCloudinary(file.buffer, 'deelaruze/pages', {
        transformation: TRANSFORMATIONS.banner,
      });

      await destroyImage(existing && existing.image);

      updateData.image = {
        url: result.secure_url,
        publicId: result.public_id,
        alt: req.body.imageAlt || '',
      };
    }

    if (req.body.clearImage === 'true' && !file) {
      await destroyImage(existing && existing.image);
      updateData.image = { url: '', publicId: '', alt: '' };
    }
    delete updateData.clearImage;
    delete updateData.imageAlt;

    const page = await PageContent.findOneAndUpdate({ slug }, updateData, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });

    res.json({ success: true, data: page });
  } catch (error) {
    console.error('SAVE PAGE CONTENT ERROR:', error);

    res.status(error.name === 'ValidationError' ? 400 : 500).json({
      success: false,
      message: 'Error saving page content',
      error: error.message,
    });
  }
};
