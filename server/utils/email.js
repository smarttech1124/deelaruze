const axios = require('axios');

let accessToken = null;
let tokenExpires = 0;

// Get SendPulse Access Token
async function getSendPulseToken() {
  if (accessToken && Date.now() < tokenExpires) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      'https://api.sendpulse.com/oauth/access_token',
      {
        grant_type: 'client_credentials',
        client_id: process.env.SENDPULSE_CLIENT_ID,
        client_secret: process.env.SENDPULSE_CLIENT_SECRET,
      }
    );

    accessToken = response.data.access_token;
    tokenExpires = Date.now() + (response.data.expires_in - 60) * 1000;

    return accessToken;
  } catch (error) {
    console.error('SendPulse Auth Error:', error.response?.data || error.message);
    return null;
  }
}

// Send Transactional Email Using Template
exports.sendEmail = async ({ to, templateId, variables }) => {
  try {
    const token = await getSendPulseToken();
    if (!token) return null;

    const response = await axios.post(
      'https://api.sendpulse.com/smtp/emails', 
      {
        email: {
          to: [{ email: to }],
          template: {
            id: templateId,
            variables: variables || {},
          },
          from: {
            name: process.env.FROM_NAME || 'Deelaruze',
            email: process.env.FROM_EMAIL,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ Email sent via SendPulse');
    return response.data;
  } catch (error) {
    console.error('❌ SendPulse Email Error:', error.response?.data || error.message);
    return null;
  }
};