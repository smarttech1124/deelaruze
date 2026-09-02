import React from 'react';
import ContentCollectionManager from '../../components/admin/ContentCollectionManager';
import { heroSlideService } from '../../services/contentService';

const FIELDS = [
  {
    name: 'title',
    label: 'Slide title',
    type: 'text',
    maxLength: 300,
    placeholder: 'Optional — leave blank for an image-only slide',
    help: 'Basic HTML is allowed, e.g. <br/> to break the line.',
  },
  {
    name: 'description',
    label: 'Supporting text',
    type: 'text',
    maxLength: 500,
    placeholder: 'Optional — shown under the title',
  },
  {
    name: 'position',
    label: 'Image placement',
    type: 'select',
    defaultValue: 'center center',
    options: [
      { value: 'center center', label: 'Centre' },
      { value: 'center top', label: 'Top' },
      { value: 'center bottom', label: 'Bottom' },
      { value: 'left center', label: 'Left' },
      { value: 'right center', label: 'Right' },
    ],
    help: 'Which part of the image stays visible when it is cropped to fit.',
  },
  {
    name: 'textPlacement',
    label: 'Text placement',
    type: 'select',
    defaultValue: 'center',
    options: [
      { value: 'center', label: 'Centre' },
      { value: 'top', label: 'Top' },
      { value: 'bottom', label: 'Bottom' },
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' },
    ],
    help: 'Where the title and supporting text sit over the image.',
  },
  {
    name: 'accent',
    label: 'Accent colour',
    type: 'color',
    defaultValue: '#FF3366',
  },
];

const HeroSlides = () => (
  <ContentCollectionManager
    title="HOMEPAGE HERO"
    description="Manage the slides in the homepage hero slider"
    itemLabel="slide"
    service={heroSlideService}
    fields={FIELDS}
    primaryField="title"
    secondaryField="description"
    imageLabel="Slide image (desktop)"
    secondaryImage={{
      name: 'mobileImage',
      label: 'Mobile image',
      help: 'Optional portrait crop used on screens under 768px.',
    }}
  />
);

export default HeroSlides;
