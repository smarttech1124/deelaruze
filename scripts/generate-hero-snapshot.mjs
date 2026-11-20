// Regenerates src/data/heroSlidesSnapshot.json from the live hero-slides API.
//
// The hero paints this snapshot on the very first frame of a first-ever visit
// (before the cold-start-prone /api/hero-slides call returns), so refreshing it
// keeps that first paint current. Returning visitors paint from their own
// localStorage cache instead, so a slightly stale snapshot only ever affects a
// brand-new visitor for the ~second before the live response swaps in.
//
// Usage: npm run snapshot:hero   (optionally HERO_API=<url> to override source)

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = process.env.HERO_API || 'https://deelaruze.com/api/hero-slides';
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src/data/heroSlidesSnapshot.json'
);

const slim = (x) => ({
  _id: x._id,
  title: x.title || '',
  description: x.description || '',
  image: { url: x.image?.url || '', alt: x.image?.alt || '' },
  mobileImage: { url: x.mobileImage?.url || '' },
  accent: x.accent || '#FF3366',
  position: x.position || 'center center',
  textPlacement: x.textPlacement || x.placement || 'center',
});

try {
  const res = await fetch(API);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const slides = (json.data || []).map(slim);
  if (!slides.length) throw new Error('API returned no slides');

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(slides, null, 2)}\n`);
  console.log(`Wrote ${slides.length} slides to ${OUT}`);
} catch (error) {
  // Non-fatal: keep the committed snapshot so a flaky network never breaks a build.
  console.warn(`hero snapshot not refreshed (${error.message}); keeping existing file`);
}
