const FromTheStreet = require('../models/FromTheStreet');
const cloudinary = require('../config/cloudinary');
const uploadToCloudinary = require('../utils/uploadToCloudinary');


// @desc    Get all fromTheStreet
// @route   GET /api/fromTheStreet
// @access  Public
exports.getFromTheStreet = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    // Build query
    const query = {
        status: 'published',
    };
    const sort = { createdAt: -1 };

    const fromthestreet = await FromTheStreet.find(query)
      .sort(sort)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: fromthestreet.length,
      data: fromthestreet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fromthestreet',
      error: error.message,
    });
  }
};

// @desc    Get single fromthestreet by ID
// @route   GET /api/fromthestreet/:id
// @access  Public
exports.getFromTheStreetById = async (req, res) => {
  try {
    const fromthestreet = await FromTheStreet.findById(req.params.id);

    if (!fromthestreet) {
      return res.status(404).json({
        success: false,
        message: 'FromTheStreet not found',
      });
    }

    res.json({
      success: true,
      data: fromthestreet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fromthestreet',
      error: error.message,
    });
  }
};

// @desc    Create fromTheStreet
// @route   POST /api/fromthestreet
// @access  Private/Admin
exports.createFromTheStreet = async (req, res) => {
  try {

    const fromthestreet = new FromTheStreet({
      ...req.body,
      images: [],
    });

    // ===============================
    // Upload Images to Cloudinary
    // ===============================
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, 'deelaruze/fromthestreet')
      );

      const results = await Promise.all(uploadPromises);

      const uploadedImages = results.map((result, index) => ({
        url: result.secure_url,
        publicId: result.public_id,
        order: index, // Set initial order based on upload sequence
      }));

      fromthestreet.images.push(...uploadedImages); 
    }

    await fromthestreet.save();

    res.status(201).json({
      success: true,
      data: fromthestreet,
    });
  } catch (error) {
    console.error("CREATE FROM THE STREET ERROR:", error);

    res.status(400).json({
      success: false,
      message: "Error creating fromTheStreet",
      error: error.message,
    });
  }
};


// @desc    Update fromTheStreet
// @route   PUT /api/fromthestreet/:id
// @access  Private/Admin

exports.updateFromTheStreet = async (req, res) => { 
  try {
    const { id } = req.params;

    const fromthestreet = await FromTheStreet.findById(id);

    if (!fromthestreet) {
      return res.status(404).json({
        success: false,
        message: 'FromTheStreet not found',
      });
    }

    const updateData = { ...req.body };

    // =========================
    // Handle image deletion
    // =========================
    let existingImages = [...fromthestreet.images];

    if (updateData.deleteImages) {
      try {
        const imagesToDelete = JSON.parse(updateData.deleteImages);
                
        if (Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
          // Delete from Cloudinary
          const deletePromises = imagesToDelete.map(imageId => {
            const imageToDelete = existingImages.find(img => img._id.toString() === imageId);
            
            if (imageToDelete && imageToDelete.publicId) {
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
        uploadToCloudinary(file.buffer, 'deelaruze/fromthestreet')
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
    const updatedFromtheStreet = await FromTheStreet.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      data: updatedFromtheStreet,
    });

  } catch (error) {
    console.error(error);

    const statusCode = error.name === 'ValidationError' ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      message: 'Error updating from the street',
      error: error.message,
    });
  }
};


// @desc    Delete from the street
// @route   DELETE /api/fromthestreet/:id
// @access  Private/Admin
exports.deleteFromTheStreet = async (req, res) => {
  try {
    const fromTheStreet = await FromTheStreet.findById(req.params.id);

    if (!fromTheStreet) {
      return res.status(404).json({
        success: false,
        message: 'From the street not found',
      });
    }

    // Delete images from Cloudinary
    if (fromTheStreet.images && fromTheStreet.images.length > 0) {
      for (const image of fromTheStreet.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }
    }

    await fromTheStreet.deleteOne();

    res.json({
      success: true,
      message: 'From the street deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting from the street',
      error: error.message,
    });
  }
};
