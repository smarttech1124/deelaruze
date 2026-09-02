const createContentRouter = require('./contentRouter');
const controller = require('../controllers/stickerController');
const { validateSticker } = require('../middleware/validate');

module.exports = createContentRouter(controller, {
  validators: validateSticker,
});
