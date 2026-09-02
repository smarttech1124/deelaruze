const createContentRouter = require('./contentRouter');
const controller = require('../controllers/heroSlideController');
const { validateHeroSlide } = require('../middleware/validate');

module.exports = createContentRouter(controller, {
  validators: validateHeroSlide,
  imageFields: ['image', 'mobileImage'],
});
