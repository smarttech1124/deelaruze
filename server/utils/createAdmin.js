
const User = require('../models/User');

const createAdminIfNotExists = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existingAdmin = await User.findOne({ role: 'admin' });

  if (existingAdmin) {
    console.log('ℹ️ Admin user already exists');
    return;
  }

  await User.create({
    name: 'Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
  });

  console.log('✅ Admin user created');
  console.log(`📧 Email: ${adminEmail}`);
  console.log(`🔑 Password: ${adminPassword}`);
};

module.exports = {
  createAdminIfNotExists,
};
