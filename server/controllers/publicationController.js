const Publication = require('../models/Publication');
const cloudinary = require('../config/cloudinary');
const uploadToCloudinary = require('../utils/uploadToCloudinary');


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

    const publication = new Publication({
      ...req.body,
      images: [],
    });

    // ===============================
    // Upload Images to Cloudinary
    // ===============================
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer)
      );

      const results = await Promise.all(uploadPromises);

      const uploadedImages = results.map((result, index) => ({
        url: result.secure_url,
        publicId: result.public_id,
        order: index, // Set initial order based on upload sequence
      }));

      publication.images.push(...uploadedImages);
    }

    await publication.save();

    res.status(201).json({
      success: true,
      data: publication,
    });
  } catch (error) {
    console.error("CREATE PUBLICATION ERROR:", error);

    res.status(400).json({
      success: false,
      message: "Error creating publication",
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
    // Handle image deletion
    // =========================
    let existingImages = [...publication.images];

    if (updateData.deleteImages) {
      try {
        const imagesToDelete = JSON.parse(updateData.deleteImages);
        
        console.log('Images to delete:', imagesToDelete);
        console.log('Existing images before deletion:', existingImages.map(img => img._id.toString()));
        
        if (Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
          // Delete from Cloudinary
          const deletePromises = imagesToDelete.map(imageId => {
            const imageToDelete = existingImages.find(img => img._id.toString() === imageId);
            console.log(`Looking for image ${imageId}:`, imageToDelete);
            
            if (imageToDelete && imageToDelete.publicId) {
              console.log(`Deleting from Cloudinary: ${imageToDelete.publicId}`);
              // return deleteFromCloudinary(imageToDelete.publicId);
              cloudinary.uploader.destroy(imageToDelete.publicId);
            }
            return Promise.resolve();
          });

          await Promise.all(deletePromises);

          // Remove from images array
          const beforeLength = existingImages.length;
          existingImages = existingImages.filter(
            img => !imagesToDelete.includes(img._id.toString())
          );
          
          console.log(`Filtered images: ${beforeLength} -> ${existingImages.length}`);
          console.log('Remaining images:', existingImages.map(img => img._id.toString()));
        }
      } catch (error) {
        console.error('Error deleting images:', error);
      }

      delete updateData.deleteImages;
    }

    // =========================
    // Handle image reordering
    // =========================
    if (updateData.imageOrder) {
      try {
        const imageOrder = JSON.parse(updateData.imageOrder);
        
        if (Array.isArray(imageOrder) && imageOrder.length > 0) {
          // Update order field for each existing image
          existingImages = existingImages.map(img => {
            // Convert to plain object if it's a Mongoose document
            const imgObj = img.toObject ? img.toObject() : { ...img };
            
            const orderInfo = imageOrder.find(
              item => item.id === imgObj._id.toString()
            );
            
            if (orderInfo !== undefined) {
              return {
                ...imgObj,
                order: orderInfo.order
              };
            }
            
            return imgObj;
          });

          // Sort images by their new order
          existingImages.sort((a, b) => {
            const orderA = a.order !== undefined ? a.order : 999;
            const orderB = b.order !== undefined ? b.order : 999;
            return orderA - orderB;
          });
        }
      } catch (error) {
        console.error('Error reordering images:', error);
      }

      delete updateData.imageOrder;
    }

    // =========================
    // Handle new uploaded images
    // =========================
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer)
      );

      const results = await Promise.all(uploadPromises);

      // Get the highest existing order value
      const maxOrder = existingImages.length > 0
        ? Math.max(...existingImages.map(img => img.order !== undefined ? img.order : 0))
        : -1;

      const uploadedImages = results.map((result, index) => ({
        url: result.secure_url,
        publicId: result.public_id,
        order: maxOrder + 1 + index, // Add new images after existing ones
      }));

      existingImages.push(...uploadedImages);
    }

    // Set the final images array
    updateData.images = existingImages;

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
