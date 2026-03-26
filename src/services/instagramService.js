/**
 * Instagram Graph API Service
 *
 * Prerequisites:
 *  1. A Facebook App with Instagram Graph API enabled.
 *  2. An Instagram Business or Creator account linked to a Facebook Page.
 *  3. A long-lived User Access Token with the scopes:
 *       instagram_basic, instagram_manage_insights, pages_show_list
 *
 * Environment variables required (e.g. in your .env file):
 *   INSTAGRAM_USER_ID=<your_instagram_user_id>
 *   INSTAGRAM_ACCESS_TOKEN=<your_long_lived_access_token>
 *
 * How to get your User ID and Access Token:
 *   https://developers.facebook.com/docs/instagram-api/getting-started
 */

const BASE_URL = 'https://graph.instagram.com';

const USER_ID = process.env.INSTAGRAM_USER_ID;
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

if (!USER_ID || !ACCESS_TOKEN) {
  console.warn(
    '[instagramService] Missing INSTAGRAM_USER_ID or ' +
    'INSTAGRAM_ACCESS_TOKEN environment variables.'
  );
}

/**
 * Fetches Instagram profile stats: username, followers_count, media_count.
 * @returns {Promise<{ username: string, followers_count: number, media_count: number }>}
 */
export const fetchProfile = async () => {
  const fields = 'id,username,followers_count,media_count,profile_picture_url,biography,website';
  const url = `${BASE_URL}/${USER_ID}?fields=${fields}&access_token=${ACCESS_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Profile fetch failed: ${res.status}`);
  }

  return res.json();
};

/**
 * Fetches the 8 most recent media posts for the account.
 * @returns {Promise<Array>} Array of post objects
 */
export const fetchRecentPosts = async (limit = 8) => {
  const fields = [
    'id',
    'media_type',      // IMAGE | VIDEO | CAROUSEL_ALBUM
    'media_url',
    'thumbnail_url',   // for VIDEO types
    'permalink',
    'like_count',
    'comments_count',
    'caption',
    'timestamp',
  ].join(',');

  const url =
    `${BASE_URL}/${USER_ID}/media` +
    `?fields=${fields}&limit=${limit}&access_token=${ACCESS_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Media fetch failed: ${res.status}`);
  }

  const data = await res.json();
  return data.data || [];
};