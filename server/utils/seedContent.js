/**
 * Seeds the admin-managed content types from the supplied artwork in images/.
 *
 *   1. unzip the archives in images/ (see images/extracted)
 *   2. npm run seed:content
 *
 * Pass --dry-run to print the planned mapping without touching Cloudinary or
 * the database.
 *
 * Every asset is uploaded to Cloudinary under a deterministic public_id, so the
 * script is safe to re-run: existing entries are left alone rather than
 * duplicated. Once seeded, everything is editable from the admin portal.
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const cloudinary = require('../config/cloudinary');
const RoaringRecord = require('../models/RoaringRecord');
const Sticker = require('../models/Sticker');
const Collaboration = require('../models/Collaboration');
const HeroSlide = require('../models/HeroSlide');

const ASSET_ROOT = path.join(__dirname, '..', '..', 'images', 'extracted');

const DRY_RUN = process.argv.includes('--dry-run');

const ARTWORK_TRANSFORMATION = [
  { width: 1600, height: 1600, crop: 'limit' },
  { quality: 'auto' },
  { fetch_format: 'auto' },
];

const BANNER_TRANSFORMATION = [
  { width: 2400, height: 1600, crop: 'limit' },
  { quality: 'auto' },
  { fetch_format: 'auto' },
];

// Filename (minus extension) -> a readable slug used as the Cloudinary public_id
const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const titleFromFile = (file) =>
  file
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .toUpperCase();

const listFiles = (folder) => {
  const dir = path.join(ASSET_ROOT, folder);

  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  Missing asset folder: ${dir} — skipping.`);
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => /\.(jpe?g|png|webp|gif)$/i.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((file) => ({ file, fullPath: path.join(dir, file) }));
};

const uploadAsset = async (fullPath, folder, publicId, transformation) => {
  const result = await cloudinary.uploader.upload(fullPath, {
    folder,
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
    transformation,
  });

  return { url: result.secure_url, publicId: result.public_id };
};

/**
 * Uploads each file in `assetFolder` and creates one document per file.
 * `buildDoc(file, index, image)` returns the document body.
 */
const seedCollection = async ({
  Model,
  label,
  assetFolder,
  cloudinaryFolder,
  transformation = ARTWORK_TRANSFORMATION,
  buildDoc,
  fileOrder,
  imageField = 'image',
}) => {
  let files = listFiles(assetFolder);
  if (files.length === 0) return;

  // Honour an explicit running order where one is defined for the folder.
  if (fileOrder) {
    files = [
      ...fileOrder
        .map((name) => files.find((entry) => entry.file === name))
        .filter(Boolean),
      ...files.filter((entry) => !fileOrder.includes(entry.file)),
    ];
  }

  console.log(`\n📦 ${label}: ${files.length} asset(s)`);

  let created = 0;
  let skipped = 0;

  for (let index = 0; index < files.length; index += 1) {
    const { file, fullPath } = files[index];
    const publicId = `${cloudinaryFolder}/${slugify(file)}`;

    if (DRY_RUN) {
      const preview = buildDoc(file, index, { url: '(pending upload)', publicId });
      const name = preview.title || preview.collaborator || '(untitled)';
      console.log(
        `   • ${file} → "${name}" [${preview.status}] as ${publicId}`
      );
      created += 1;
      continue;
    }

    const existing = await Model.findOne({ [`${imageField}.publicId`]: publicId });

    if (existing) {
      skipped += 1;
      continue;
    }

    const image = await uploadAsset(
      fullPath,
      cloudinaryFolder,
      slugify(file),
      transformation
    );

    await Model.create({ ...buildDoc(file, index, image), order: index });

    created += 1;
    console.log(`   ✓ ${file}`);
  }

  console.log(
    DRY_RUN
      ? `   → ${created} would be created`
      : `   → ${created} created, ${skipped} already present`
  );
};

const run = async () => {
  if (DRY_RUN) {
    console.log('🔍 Dry run — nothing will be uploaded or written.');
  } else {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set. Add it to .env before seeding.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  }

  // ── Roaring Records ──────────────────────────────────────────────────────
  // Names come from the supplied filenames; subtitle/description are left for
  // the admin to write in the portal.
  const RECORD_TITLES = {
    'RR logo.jpeg': 'ROARING RECORDS',
    'SOML visual.jpeg': 'SOML',
    'TEACHER visual.jpg': 'TEACHER',
  };

  await seedCollection({
    Model: RoaringRecord,
    label: 'Roaring Records',
    assetFolder: 'roaring-records',
    cloudinaryFolder: 'deelaruze/roaring-records',
    fileOrder: ['RR logo.jpeg', 'SOML visual.jpeg', 'TEACHER visual.jpg'],
    buildDoc: (file, index, image) => ({
      title: RECORD_TITLES[file] || titleFromFile(file),
      subtitle: '',
      description: '',
      image: { ...image, alt: `${RECORD_TITLES[file] || titleFromFile(file)} artwork` },
      status: 'published',
    }),
  });

  // ── Stickers ─────────────────────────────────────────────────────────────
  // Sticker names are optional on the frontend, so they ship untitled.
  await seedCollection({
    Model: Sticker,
    label: 'Stickers',
    assetFolder: 'stickers',
    cloudinaryFolder: 'deelaruze/stickers',
    buildDoc: (file, index, image) => ({
      title: '',
      image: { ...image, alt: 'Deelaruze sticker artwork' },
      status: 'published',
    }),
  });

  // ── Collaborations ───────────────────────────────────────────────────────
  // Collaborator names are not derivable from the filenames, so these are
  // seeded as drafts for an admin to name and publish.
  await seedCollection({
    Model: Collaboration,
    label: 'Collaborations',
    assetFolder: 'collaboration',
    cloudinaryFolder: 'deelaruze/collaborations',
    imageField: 'images',
    buildDoc: (file, index, image) => ({
      collaborator: titleFromFile(file),
      // One artwork each to start with; admins can add up to five per entry.
      images: [{ ...image, alt: 'Deelaruze collaboration artwork' }],
      status: 'draft',
    }),
  });

  // ── Homepage hero ────────────────────────────────────────────────────────
  await seedCollection({
    Model: HeroSlide,
    label: 'Hero slides',
    assetFolder: 'main-slides',
    cloudinaryFolder: 'deelaruze/hero-slides',
    transformation: BANNER_TRANSFORMATION,
    buildDoc: (file, index, image) => ({
      title: '',
      description: '',
      image: { ...image, alt: 'Deelaruze artwork' },
      accent: '#FF3366',
      position: 'center center',
      textPlacement: 'center',
      status: 'published',
    }),
  });

  if (!DRY_RUN) await mongoose.disconnect();
  console.log(DRY_RUN ? '\n✅ Dry run complete\n' : '\n✅ Seeding complete\n');
};

run().catch(async (error) => {
  console.error('\n❌ Seeding failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
