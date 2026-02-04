const nodemailer = require('nodemailer');

// Create transporter with fallback configuration
let transporter;

try {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} catch (error) {
  console.warn('⚠️  Email transporter not configured. Email features will be disabled.');
  console.warn('   Add SMTP credentials to .env to enable email notifications.');
}

exports.sendEmail = async ({ to, subject, text, html }) => {
  // If transporter is not configured, log instead of sending
  if (!transporter) {
    console.log('📧 Email would be sent (transporter not configured):');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Message: ${text}`);
    return { messageId: 'mock-email-' + Date.now() };
  }

  try {
    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Deelaruze'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br>'),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    // Don't throw error - log it and continue
    // This prevents email failures from breaking the app
    return null;
  }
};