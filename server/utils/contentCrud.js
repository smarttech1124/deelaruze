const cloudinary = require('../config/cloudinary');
const uploadToCloudinary = require('./uploadToCloudinary');

// Sizing presets — keeps artwork sharp while staying light over the wire.
const TRANSFORMATIONS = {
  artwork: [
    { width: 1600, height: 1600, crop: 'limit' },
    { quality: 'auto' },
    { fetch_format: 'auto' },
  ],
  banner: [
    { width: 2400, height: 1600, crop: 'limit' },
    { quality: 'auto' },
    { fetch_format: 'auto' },
  ],
};

const destroyImage = async (image) => {
  if (image && image.publicId) {
    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch (error) {
      // A dangling Cloudinary asset must never block the admin action.
      console.error('Cloudinary destroy failed:', error.message);
    }
  }
};

// multer .fields() hands back { fieldName: [file] }
const fileFor = (req, field) => {
  if (!req.files || Array.isArray(req.files)) return null;
  const bucket = req.files[field];
  return bucket && bucket.length > 0 ? bucket[0] : null;
};

/**
 * Builds the standard set of admin-managed content handlers:
 * public list, admin list, read, create, update, status toggle, reorder, delete.
 *
 * @param {Object}   config
 * @param {Model}    config.Model         mongoose model
 * @param {string}   config.folder        cloudinary folder
 * @param {string}   config.label         human label used in messages
 * @param {string[]} config.imageFields   file fields handled for this type
 * @param {string}   config.requiredImage image field that must exist on create
 * @param {string}   config.preset        transformation preset key
 */
const createContentController = ({
  Model,
  folder,
  label,
  imageFields = ['image'],
  requiredImage = 'image',
  preset = 'artwork',
}) => {
  const transformation = TRANSFORMATIONS[preset] || TRANSFORMATIONS.artwork;

  // Uploads any files present on the request and returns { field: imageObject }
  const uploadImages = async (req) => {
    const uploaded = {};

    for (const field of imageFields) {
      const file = fileFor(req, field);
      if (!file) continue;

      const result = await uploadToCloudinary(file.buffer, folder, { transformation });

      uploaded[field] = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    return uploaded;
  };

  // Alt text arrives as a flat `imageAlt` field (multipart bodies are not nested),
  // so it is folded back onto the image object here.
  const applyImageAlt = (data, existingImage) => {
    if (data.imageAlt === undefined) return;

    const base = data.image || (existingImage && existingImage.toObject
      ? existingImage.toObject()
      : existingImage) || {};

    data.image = { ...base, alt: data.imageAlt };
    delete data.imageAlt;
  };

  const nextOrder = async () => {
    const last = await Model.findOne().sort({ order: -1 }).select('order');
    return last && typeof last.order === 'number' ? last.order + 1 : 0;
  };

  return {
    // @desc   Published entries, in admin-defined order
    // @access Public
    list: async (req, res) => {
      try {
        const items = await Model.find({ status: 'published' }).sort({
          order: 1,
          createdAt: 1,
        });

        res.json({ success: true, count: items.length, data: items });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error fetching ' + label,
          error: error.message,
        });
      }
    },

    // @desc   Every entry regardless of status
    // @access Private/Admin
    listAll: async (req, res) => {
      try {
        const items = await Model.find().sort({ order: 1, createdAt: 1 });

        res.json({ success: true, count: items.length, data: items });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error fetching ' + label,
          error: error.message,
        });
      }
    },

    getById: async (req, res) => {
      try {
        const item = await Model.findById(req.params.id);

        if (!item) {
          return res.status(404).json({ success: false, message: label + ' not found' });
        }

        res.json({ success: true, data: item });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error fetching ' + label,
          error: error.message,
        });
      }
    },

    // @access Private/Admin
    create: async (req, res) => {
      try {
        const uploaded = await uploadImages(req);

        if (requiredImage && !uploaded[requiredImage]) {
          return res.status(400).json({
            success: false,
            message: 'An image is required',
          });
        }

        const payload = { ...req.body, ...uploaded };
        applyImageAlt(payload, null);

        // New entries go to the end of the list unless a position is supplied.
        payload.order =
          req.body.order !== undefined && req.body.order !== ''
            ? Number(req.body.order)
            : await nextOrder();

        const item = await Model.create(payload);

        res.status(201).json({ success: true, data: item });
      } catch (error) {
        console.error('CREATE CONTENT ERROR (' + label + '):', error);

        res.status(error.name === 'ValidationError' ? 400 : 500).json({
          success: false,
          message: 'Error creating ' + label,
          error: error.message,
        });
      }
    },

    // @access Private/Admin
    update: async (req, res) => {
      try {
        const item = await Model.findById(req.params.id);

        if (!item) {
          return res.status(404).json({ success: false, message: label + ' not found' });
        }

        const uploaded = await uploadImages(req);
        const updateData = { ...req.body, ...uploaded };
        applyImageAlt(updateData, item.image);

        // Replace-in-place: drop the superseded asset from Cloudinary.
        for (const field of Object.keys(uploaded)) {
          await destroyImage(item[field]);
        }

        // Explicit removal of the optional secondary artwork
        if (updateData.clearMobileImage === 'true' && !uploaded.mobileImage) {
          await destroyImage(item.mobileImage);
          updateData.mobileImage = { url: '', publicId: '' };
        }
        delete updateData.clearMobileImage;

        if (updateData.order !== undefined && updateData.order !== '') {
          updateData.order = Number(updateData.order);
        } else {
          delete updateData.order;
        }

        const updated = await Model.findByIdAndUpdate(req.params.id, updateData, {
          new: true,
          runValidators: true,
        });

        res.json({ success: true, data: updated });
      } catch (error) {
        console.error('UPDATE CONTENT ERROR (' + label + '):', error);

        res.status(error.name === 'ValidationError' ? 400 : 500).json({
          success: false,
          message: 'Error updating ' + label,
          error: error.message,
        });
      }
    },

    // @desc   Publish / unpublish a single entry
    // @access Private/Admin
    setStatus: async (req, res) => {
      try {
        const { status } = req.body;

        if (!['draft', 'published'].includes(status)) {
          return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const item = await Model.findByIdAndUpdate(
          req.params.id,
          { status },
          { new: true, runValidators: true }
        );

        if (!item) {
          return res.status(404).json({ success: false, message: label + ' not found' });
        }

        res.json({ success: true, data: item });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error updating ' + label,
          error: error.message,
        });
      }
    },

    // @desc   Persist a new display order
    // @route  PATCH /reorder   body: { items: [{ id, order }] }
    // @access Private/Admin
    reorder: async (req, res) => {
      try {
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'items must be a non-empty array',
          });
        }

        await Model.bulkWrite(
          items.map((entry, index) => ({
            updateOne: {
              filter: { _id: entry.id },
              update: {
                $set: {
                  order: typeof entry.order === 'number' ? entry.order : index,
                },
              },
            },
          }))
        );

        const updated = await Model.find().sort({ order: 1, createdAt: 1 });

        res.json({ success: true, count: updated.length, data: updated });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error reordering ' + label,
          error: error.message,
        });
      }
    },

    // @access Private/Admin
    remove: async (req, res) => {
      try {
        const item = await Model.findById(req.params.id);

        if (!item) {
          return res.status(404).json({ success: false, message: label + ' not found' });
        }

        for (const field of imageFields) {
          await destroyImage(item[field]);
        }

        await item.deleteOne();

        res.json({ success: true, message: label + ' deleted successfully' });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error deleting ' + label,
          error: error.message,
        });
      }
    },
  };
};

module.exports = createContentController;
module.exports.TRANSFORMATIONS = TRANSFORMATIONS;
module.exports.destroyImage = destroyImage;
module.exports.fileFor = fileFor;
