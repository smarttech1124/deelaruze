const axios = require('axios');

const postmark = axios.create({
  baseURL: 'https://api.postmarkapp.com',
  headers: {
    'Accept':                  'application/json',
    'Content-Type':            'application/json',
    'X-Postmark-Server-Token': process.env.POSTMARK_SERVER_TOKEN,
  },
});

// Send Transactional Email Using Postmark Template
exports.sendEmail = async ({ to, templateId, variables }) => {
  try {
    // Ensure every variable value is a string — guards against number/boolean
    // values that can cause unexpected rendering in Postmark templates
    const safeVariables = Object.fromEntries(
      Object.entries(variables || {}).map(([k, v]) => [ 
        k,
        typeof v === 'boolean' ? v : String(v ?? ''),
      ])
    );

    const response = await postmark.post('/email/withTemplate', {
      From:       `${process.env.FROM_NAME || 'Deelaruze'} <${process.env.FROM_EMAIL}>`,
      To:         to,
      TemplateId: templateId,   // use TemplateId: <number> if you prefer numeric IDs
      TemplateModel: safeVariables,
      MessageStream: 'outbound',   // change to your broadcast stream name if needed
    });

    console.log(`✅ Email sent to ${to} via Postmark (MessageID: ${response.data.MessageID})`);
    return response.data;

  } catch (error) {
    const postmarkError = error.response?.data;
    console.error(
      `❌ Postmark Email Error (to: ${to}) — Code ${postmarkError?.ErrorCode}: ${postmarkError?.Message || error.message}`
    );
    return null;
  }
};