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
    const stringifyValue = (v) => {
      if (v === null || v === undefined) return '';
      if (typeof v === 'boolean')        return v;
      if (typeof v === 'object') {
        // Pass nested object values through as-is (numbers stay numbers)
        return Object.fromEntries(
          Object.entries(v).map(([ik, iv]) => [ik, iv ?? ''])
        );
      }
      return String(v);
    };

    const safeVariables = Object.fromEntries(
      Object.entries(variables || {}).map(([k, v]) => [k, stringifyValue(v)])
    );

    const response = await postmark.post('/email/withTemplate', {
      From:       `${process.env.FROM_NAME || 'Deelaruze'} <${process.env.FROM_EMAIL}>`,
      To:         to,
      TemplateId: templateId,
      TemplateModel: safeVariables,
      MessageStream: 'outbound',
    });

    // console.log(`✅ Email sent to ${to} via Postmark (MessageID: ${response.data.MessageID})`);
    return response.data;

  } catch (error) {
    const postmarkError = error.response?.data;
    console.error(
      `❌ Postmark Email Error (to: ${to}) — Code ${postmarkError?.ErrorCode}: ${postmarkError?.Message || error.message}`
    );
    return null;
  }
};
