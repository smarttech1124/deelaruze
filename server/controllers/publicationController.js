const Publication = require('../models/Publication');
const cloudinary = require('../config/cloudinary');

// @desc    Get all publications
// @route   GET /api/publications
// @access  Public
exports.getAllPublications = async (req, res) => {
  try {
    const { category, status, featured, sort = '-createdAt', limit = 20 } = req.query;

    // Build query
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (featured) query.featured = featured === 'true';

    const publications = await Publication.find(query)
      .sort(sort)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: publications.length,
      data: publications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching publications',
      error: error.message,
    });
  }
};

// @desc    Get single publication
// @route   GET /api/publications/:id
// @access  Public
exports.getPublication = async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id);

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found',
      });
    }

    res.json({
      success: true,
      data: publication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching publication',
      error: error.message,
    });
  }
};

// @desc    Get publication by slug
// @route   GET /api/publications/slug/:slug
// @access  Public
exports.getPublicationBySlug = async (req, res) => {
  try {
    const publication = await Publication.findOne({ slug: req.params.slug });

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found',
      });
    }

    res.json({
      success: true,
      data: publication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching publication',
      error: error.message,
    });
  }
};

// @desc    Get featured publications
// @route   GET /api/publications/featured
// @access  Public
exports.getFeaturedPublications = async (req, res) => {
  try {
    const publications = await Publication.find({ featured: true })
      .sort('-createdAt')
      .limit(6);

    res.json({
      success: true,
      count: publications.length,
      data: publications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured publications',
      error: error.message,
    });
  }
};

// @desc    Create publication
// @route   POST /api/publications
// @access  Private/Admin
exports.createPublication = async (req, res) => {
  try {
    let publication = new Publication({
      ...req.body,
      images: [],
    });

    // Upload images in parallel
    const uploadPromises = req.files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: 'deelaruze/publications',
        transformation: [
          { width: 1200, height: 1500, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      })
    );

    const results = await Promise.all(uploadPromises);

    const uploadedImages = results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
    }));

    // Add images
    publication.images.push(...uploadedImages);

    await publication.save();

    res.status(201).json({
      success: true,
      data: publication,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating publication',
      error: error.message,
    });
  }
};

// @desc    Update publication
// @route   PUT /api/publications/:id
// @access  Private/Admin

exports.updatePublication = async (req, res) => {
  try {
    const { id } = req.params;

    const publication = await Publication.findById(id);

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found',
      });
    }

    const updateData = { ...req.body };

    // =========================
    // Parse FormData values
    // =========================

    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }

    if (updateData.stock !== undefined) {
      updateData.stock = Number(updateData.stock);
    }

    if (updateData.featured !== undefined) {
      updateData.featured =
        updateData.featured === 'true' || updateData.featured === true;
    }

    // =========================
    // Handle uploaded images
    // =========================
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: 'deelaruze/publications',
          transformation: [
            { width: 1200, height: 1500, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        })
      );

      const results = await Promise.all(uploadPromises);

      const uploadedImages = results.map((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
      }));

      // Merge with existing images
      updateData.images = [
        ...publication.images,
        ...uploadedImages,
      ];
    }

    // =========================
    // Perform single update
    // =========================
    const updatedPublication = await Publication.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      data: updatedPublication,
    });

  } catch (error) {
    console.error(error);

    const statusCode = error.name === 'ValidationError' ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      message: 'Error updating publication',
      error: error.message,
    });
  }
};



// @desc    Delete publication
// @route   DELETE /api/publications/:id
// @access  Private/Admin
exports.deletePublication = async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id);

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found',
      });
    }

    // Delete images from Cloudinary
    if (publication.images && publication.images.length > 0) {
      for (const image of publication.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }
    }

    await publication.deleteOne();

    res.json({
      success: true,
      message: 'Publication deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting publication',
      error: error.message,
    });
  }
};

// @desc    Upload publication images
// @route   POST /api/publications/:id/images
// @access  Private/Admin
exports.uploadImages = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('creating...............########')

    // if (!req.files || req.files.length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'No images provided',
    //   });
    // }

    let publication;

    // ==========================
    // EDIT → Update existing
    // ==========================
    if (id) {
      publication = await Publication.findById(id);

      if (!publication) {
        return res.status(404).json({
          success: false,
          message: 'Publication not found',
        });
      }
    } 
    // ==========================
    // POST → Create new
    // ==========================
    else {
      publication = new Publication({
        ...req.body,
        images: [],
      });
    }

    // Upload images in parallel
    const uploadPromises = req.files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: 'deelaruze/publications',
        transformation: [
          { width: 1200, height: 1500, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      })
    );

    const results = await Promise.all(uploadPromises);

    const uploadedImages = results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
    }));

    // Add images
    publication.images.push(...uploadedImages);

    await publication.save();

    return res.status(id ? 200 : 201).json({
      success: true,
      message: id
        ? 'Images uploaded successfully'
        : 'Publication created successfully',
      data: publication,
    });
  } catch (error) {
    console.error('Upload error:', error);

    return res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message,
    });
  }
};
