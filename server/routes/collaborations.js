const createContentRouter = require('./contentRouter');
const controller = require('../controllers/collaborationController');
const { validateCollaboration } = require('../middleware/validate');

module.exports = createContentRouter(controller, {
  validators: validateCollaboration,
});
