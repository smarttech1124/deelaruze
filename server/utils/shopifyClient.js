// utils/shopifyClient.js
// Shopify 2025+ headless integration
// Admin API via OAuth code flow, Storefront API via token
// Uses SHOPIFY_STORE_DOMAIN, SHOPIFY_CLIENT_ID, SHOPIFY_SECRET, SHOPIFY_OAUTH_CODE, REDIRECT_URI

const fetch = require('node-fetch');

const {
  SHOPIFY_STORE_DOMAIN,
  SHOPIFY_CLIENT_ID,
  SHOPIFY_SECRET,
  SHOPIFY_STOREFRONT_SECRET,  
  SHOPIFY_STOREFRONT_TOKEN
} = process.env;

const ADMIN_API_VERSION = '2025-10';
const STOREFRONT_API_VERSION = '2025-10';
const CLIENT_CREDENTIALS = "client_credentials";

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_CLIENT_ID || !SHOPIFY_SECRET || !SHOPIFY_STOREFRONT_SECRET) {
  throw new Error('Missing required Shopify environment variables');
}

// ----------------------------
// Admin OAuth Token (cached)
// ----------------------------
let adminAccessTokenCache = { token: null, expiresAt: null };

async function getAdminAccessToken() {
  if (adminAccessTokenCache.token && adminAccessTokenCache.expiresAt > Date.now()) {
    return adminAccessTokenCache.token;
  }

  // Exchange OAuth code for Admin token
  const res = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: SHOPIFY_CLIENT_ID,
      client_secret: SHOPIFY_SECRET,
      grant_type: CLIENT_CREDENTIALS
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Failed to obtain Admin token: ${JSON.stringify(data)}`);
  }

  // 2025 tokens don’t expire by default, but cache anyway
  adminAccessTokenCache = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000  };

  return data.access_token;
}

// ----------------------------
// Admin GraphQL Request
// ----------------------------
async function adminRequest(query, variables = {}) {
  const token = await getAdminAccessToken();

  const res = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(`Admin GraphQL Error: ${JSON.stringify(json.errors || json)}`);
  }
  return json.data;
}

// ----------------------------
// Storefront Token Management (cached)
// ----------------------------
let storefrontTokenCache = { token: null, expiresAt: null };

async function getStorefrontAccessToken() {
  if (storefrontTokenCache.token && storefrontTokenCache.expiresAt > Date.now()) {
    return storefrontTokenCache.token;
  }
  const token = await getAdminAccessToken();

  storefrontTokenCache = { token:token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() };
  console.log('store front token: ', storefrontTokenCache)
  return token;
}

// ----------------------------
// Storefront GraphQL Request
// ----------------------------
async function storefrontRequest(query, variables = {}) {

  const res = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/api/${STOREFRONT_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(`Storefront GraphQL Error: ${JSON.stringify(json.errors || json)}`);
  }

  return json.data;
}

module.exports = {
  adminRequest,
  storefrontRequest,
  getAdminAccessToken,
  getStorefrontAccessToken,
};
