const Collaboration = require('../models/Collaboration');
const createContentController = require('../utils/contentCrud');

module.exports = createContentController({
  Model: Collaboration,
  folder: 'deelaruze/collaborations',
  label: 'collaboration',
  gallery: { field: 'images', min: 1, max: 5 },
});
