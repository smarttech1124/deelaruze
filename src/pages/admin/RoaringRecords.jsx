import React from 'react';
import ContentCollectionManager from '../../components/admin/ContentCollectionManager';
import { roaringRecordService } from '../../services/contentService';

const FIELDS = [
  {
    name: 'title',
    label: 'Record name',
    type: 'text',
    required: true,
    maxLength: 200,
    placeholder: 'e.g. SONGS OF MY LIFE',
  },
  {
    name: 'subtitle',
    label: 'Subtitle',
    type: 'text',
    maxLength: 300,
    placeholder: 'e.g. LP / 2026',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    rows: 8,
    placeholder: 'Tell the story behind this record…',
  },
  {
    name: 'mediaUrl',
    label: 'Audio / video link (optional)',
    type: 'text',
    placeholder: 'https://…',
    help:
      'YouTube, Vimeo, Spotify, SoundCloud or a direct MP3/MP4 link plays inline ' +
      'on the Roaring Records page. Anything else opens in a new tab.',
  },
  {
    name: 'mediaLabel',
    label: 'Button text',
    type: 'text',
    maxLength: 60,
    placeholder: 'LISTEN NOW',
    help: 'Leave blank to pick automatically — WATCH NOW for video, LISTEN NOW for audio.',
  },
];

const RoaringRecords = () => (
  <ContentCollectionManager
    title="ROARING RECORDS"
    description="Manage the records shown on the Roaring Records page"
    itemLabel="record"
    service={roaringRecordService}
    fields={FIELDS}
    primaryField="title"
    secondaryField="subtitle"
    imageLabel="Record artwork"
  />
);

export default RoaringRecords;
