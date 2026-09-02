const express = require('express');

const { protect, authorize } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');
const imageUpload = require('../middleware/imageUpload');

/**
 * Builds the REST surface shared by every admin-managed content type.
 *
 *   GET    /             published entries (public)
 *   GET    /all          every entry (admin)
 *   PATCH  /reorder      persist display order (admin)
 *   GET    /:id          single entry (public)
 *   POST   /             create (admin)
 *   PUT    /:id          update (admin)
 *   PATCH  /:id/status   publish / unpublish (admin)
 *   DELETE /:id          delete (admin)
 *
 * @param {Object}   controller    handlers from utils/contentCrud
 * @param {Object}   [options]
 * @param {Array}    options.validators  express-validator chain for create/update
 * @param {string[]} options.imageFields file fields accepted on upload
 */
const createContentRouter = (controller, options = {}) => {
  const router = express.Router();
  const { validators = [], imageFields = ['image'] } = options;

  const upload = imageUpload().fields(
    imageFields.map((name) => ({ name, maxCount: 1 }))
  );

  // ── Public ──────────────────────────────────────────────────────────────
  router.get('/', controller.list);

  // ── Admin ───────────────────────────────────────────────────────────────
  // Declared before '/:id' so the literal paths are not swallowed by the param.
  router.get('/all', protect, authorize('admin'), controller.listAll);
  router.patch('/reorder', protect, authorize('admin'), controller.reorder);

  router.get('/:id', validateObjectId, controller.getById);

  router.post('/', protect, authorize('admin'), upload, ...validators, controller.create);

  router.put(
    '/:id',
    protect,
    authorize('admin'),
    upload,
    validateObjectId,
    ...validators,
    controller.update
  );

  router.patch(
    '/:id/status',
    protect,
    authorize('admin'),
    validateObjectId,
    controller.setStatus
  );

  router.delete('/:id', protect, authorize('admin'), validateObjectId, controller.remove);

  return router;
};

module.exports = createContentRouter;
