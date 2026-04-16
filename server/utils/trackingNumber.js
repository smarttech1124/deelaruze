const crypto = require('crypto');

const generateOrderNumber = () => {
  const prefix = 'DLZ';
  const timestamp = Date.now().toString().slice(-6); // last 6 digits
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();

  return `${prefix}-${timestamp}-${random}`;
};

module.exports = generateOrderNumber;
