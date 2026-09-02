import React from 'react';
import ContentCollectionManager from '../../components/admin/ContentCollectionManager';
import { stickerService } from '../../services/contentService';

const FIELDS = [
  {
    name: 'title',
    label: 'Sticker name',
    type: 'text',
    maxLength: 200,
    placeholder: 'e.g. DEELA TAG',
    help: 'Optional, for your reference in the admin only — not shown on the site.',
  },
];

const Stickers = () => (
  <ContentCollectionManager
    title="STICKERS"
    description="Manage the sticker artwork gallery"
    itemLabel="sticker"
    service={stickerService}
    fields={FIELDS}
    primaryField="title"
    imageLabel="Sticker artwork"
    multiUpload
    bulkTitleFromFilename={false}
    bulkAltText="Deelaruze sticker artwork"
  />
);

export default Stickers;
