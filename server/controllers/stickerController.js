const Sticker = require('../models/Sticker');
const createContentController = require('../utils/contentCrud');

module.exports = createContentController({
  Model: Sticker,
  folder: 'deelaruze/stickers',
  label: 'sticker',
});
