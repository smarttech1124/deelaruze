// Inject on-the-fly Cloudinary delivery transforms into a stored image URL.
//
// Stored URLs look like:
//   https://res.cloudinary.com/<cloud>/image/upload/v123/folder/name.jpg
// We splice a transform segment right after `/upload/` so Cloudinary serves a
// smaller, format-optimised image (f_auto picks WebP/AVIF, q_auto trims bytes).
// This is the main lever for getting hero artwork to appear quickly instead of
// downloading the full-size original.

export const optimizeCloudinary = (rawUrl, { width, quality = 'auto' } = {}) => {
  const url = (rawUrl || '').trim();
  if (!url) return '';

  // Only transform Cloudinary delivery URLs; leave anything else untouched.
  const marker = '/image/upload/';
  const idx = url.indexOf(marker);
  if (!url.includes('res.cloudinary.com') || idx === -1) return url;

  const insertAt = idx + marker.length;

  // Don't double-transform a URL that already carries a transform segment.
  const rest = url.slice(insertAt);
  if (/^(?:[a-z]{1,3}_[^/]+)(?:,[a-z]{1,3}_[^/]+)*\//.test(rest)) return url;

  const parts = [`f_auto`, `q_${quality}`, `c_limit`];
  if (width) parts.push(`w_${width}`);
  const transform = parts.join(',');

  return `${url.slice(0, insertAt)}${transform}/${rest}`;
};

export default optimizeCloudinary;
