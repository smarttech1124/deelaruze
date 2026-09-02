const RoaringRecord = require('../models/RoaringRecord');
const createContentController = require('../utils/contentCrud');

module.exports = createContentController({
  Model: RoaringRecord,
  folder: 'deelaruze/roaring-records',
  label: 'roaring record',
});
