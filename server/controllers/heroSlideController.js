const HeroSlide = require('../models/HeroSlide');
const createContentController = require('../utils/contentCrud');

module.exports = createContentController({
  Model: HeroSlide,
  folder: 'deelaruze/hero-slides',
  label: 'hero slide',
  imageFields: ['image', 'mobileImage'],
  requiredImage: 'image',
  preset: 'banner',
});
