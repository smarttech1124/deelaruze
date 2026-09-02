import React from 'react';
import ContentCollectionManager from '../../components/admin/ContentCollectionManager';
import { collaborationService } from '../../services/contentService';

const FIELDS = [
  {
    name: 'collaborator',
    label: 'Collaborator name',
    type: 'text',
    required: true,
    maxLength: 200,
    placeholder: 'e.g. ARTIST NAME',
  },
  {
    name: 'title',
    label: 'Project title',
    type: 'text',
    maxLength: 200,
    placeholder: 'Optional — e.g. CAPSULE DROP 01',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    rows: 5,
    maxLength: 1000,
    placeholder: 'Optional — a short note about the collaboration',
  },
  {
    name: 'link',
    label: 'Link',
    type: 'text',
    placeholder: 'Optional — https://…',
    help: 'When set, the card links out to this URL.',
  },
];

const Collaborations = () => (
  <ContentCollectionManager
    title="COLLABORATIONS"
    description="Manage the collaborations shown on the site"
    itemLabel="collaboration"
    service={collaborationService}
    fields={FIELDS}
    primaryField="collaborator"
    secondaryField="title"
    imageLabel="Collaboration artwork"
    gallery={{ field: 'images', min: 1, max: 5 }}
  />
);

export default Collaborations;
