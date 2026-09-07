const createContentRouter = require('./contentRouter');
const controller = require('../controllers/roaringRecordController');
const { validateRoaringRecord } = require('../middleware/validate');

module.exports = createContentRouter(controller, {
  validators: validateRoaringRecord,
});
