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

// The single ordering used by every read, so the admin list and the public
// site can never disagree about the sequence. `_id` is the final tiebreaker:
// without a unique key MongoDB's sort is not stable, so entries sharing an
// `order` could come back in a different sequence from one query to the next.
const LIST_SORT = { order: 1, createdAt: 1, _id: 1 };

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
 * @param {Object}   config.gallery       { field, min, max } to store an array
 *                                        of images instead of a single one
 */
const createContentController = ({
  Model,
  folder,
  label,
  imageFields = ['image'],
  requiredImage = 'image',
  preset = 'artwork',
  gallery = null,
}) => {
  const transformation = TRANSFORMATIONS[preset] || TRANSFORMATIONS.artwork;
  const galleryField = gallery ? gallery.field || 'images' : null;
  const minImages = gallery ? gallery.min ?? 1 : 0;
  const maxImages = gallery ? gallery.max ?? 10 : 0;

  const countError = (count) => {
    if (count < minImages) {
      return `At least ${minImages} image${minImages === 1 ? ' is' : 's are'} required`;
    }
    if (count > maxImages) {
      return `No more than ${maxImages} images are allowed`;
    }
    return null;
  };

  const galleryFilesIn = (req) =>
    (req.files && !Array.isArray(req.files) && req.files[galleryField]) || [];

  // Uploads every file sent under the gallery field, in the order supplied.
  const uploadGallery = async (req, alt) => {
    const files = galleryFilesIn(req);

    const results = await Promise.all(
      files.map((file) => uploadToCloudinary(file.buffer, folder, { transformation }))
    );

    return results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
      alt: alt || '',
    }));
  };

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
        const items = await Model.find({ status: 'published' }).sort(LIST_SORT);

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
        const items = await Model.find().sort(LIST_SORT);

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
        const payload = { ...req.body };

        if (gallery) {
          // Check the count before uploading so a rejected request never
          // leaves orphaned assets on Cloudinary.
          const problem = countError(galleryFilesIn(req).length);

          if (problem) {
            return res.status(400).json({ success: false, message: problem });
          }

          payload[galleryField] = await uploadGallery(req, req.body.imageAlt);
          delete payload.imageAlt;
        } else {
          const uploaded = await uploadImages(req);

          if (requiredImage && !uploaded[requiredImage]) {
            return res.status(400).json({
              success: false,
              message: 'An image is required',
            });
          }

          Object.assign(payload, uploaded);
          applyImageAlt(payload, null);
        }

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

        const updateData = { ...req.body };

        if (gallery) {
          const alt = req.body.imageAlt;
          const current = (item[galleryField] || []).map((img) =>
            img.toObject ? img.toObject() : { ...img }
          );

          // 1. Work out which saved images the admin wants removed.
          let toDelete = [];
          if (updateData.deleteImages) {
            try {
              const parsed = JSON.parse(updateData.deleteImages);
              if (Array.isArray(parsed)) toDelete = parsed.map(String);
            } catch (parseError) {
              console.error('Invalid deleteImages payload:', parseError.message);
            }
          }
          delete updateData.deleteImages;

          const kept = current.filter((img) => !toDelete.includes(String(img._id)));
          const removed = current.filter((img) => toDelete.includes(String(img._id)));

          // 2. Validate the resulting count BEFORE anything is uploaded or
          //    destroyed, so a rejected request leaves the entry untouched.
          const problem = countError(kept.length + galleryFilesIn(req).length);
          if (problem) {
            return res.status(400).json({ success: false, message: problem });
          }

          // 3. Apply any new running order to the images being kept.
          if (updateData.imageOrder) {
            try {
              const order = JSON.parse(updateData.imageOrder);
              if (Array.isArray(order) && order.length > 0) {
                const rank = new Map(order.map((entry, i) => [entry.id, entry.order ?? i]));
                kept.sort(
                  (a, b) =>
                    (rank.get(String(a._id)) ?? 999) - (rank.get(String(b._id)) ?? 999)
                );
              }
            } catch (parseError) {
              console.error('Invalid imageOrder payload:', parseError.message);
            }
          }
          delete updateData.imageOrder;

          // 4. Commit: upload the new artwork, then drop the removed assets.
          let images = [...kept, ...(await uploadGallery(req, alt))];

          if (alt !== undefined) {
            images = images.map((img) => ({ ...img, alt }));
          }

          for (const img of removed) {
            await destroyImage(img);
          }

          updateData[galleryField] = images;
          delete updateData.imageAlt;
        } else {
          const uploaded = await uploadImages(req);
          Object.assign(updateData, uploaded);
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
        }

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

        // The position in the submitted array is the order — rewriting it as a
        // contiguous 0..n-1 run keeps the sequence gap-free and unambiguous,
        // whatever the client sent.
        const result = await Model.bulkWrite(
          items.map((entry, index) => ({
            updateOne: {
              filter: { _id: entry.id },
              update: { $set: { order: index } },
            },
          }))
        );

        // A filter that matches nothing means the ids never reached the
        // documents — surface it rather than silently reporting success.
        if (result.matchedCount === 0) {
          return res.status(400).json({
            success: false,
            message: 'None of the supplied ids matched an existing ' + label,
          });
        }

        const updated = await Model.find().sort(LIST_SORT);

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

        if (gallery) {
          for (const img of item[galleryField] || []) {
            await destroyImage(img);
          }
        } else {
          for (const field of imageFields) {
            await destroyImage(item[field]);
          }
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
