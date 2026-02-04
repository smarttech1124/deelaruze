// API Constants
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

// Publication Categories
export const PUBLICATION_CATEGORIES = {
  ZINE: 'zine',
  STICKER_PACK: 'sticker pack',
  VOLUME: 'volume',
  SPECIAL_EDITION: 'special edition',
};

// Publication Status
export const PUBLICATION_STATUS = {
  AVAILABLE: 'available',
  SOLD_OUT: 'sold out',
  COMING_SOON: 'coming soon',
};

// Submission Status
export const SUBMISSION_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Social Media
export const SOCIAL_LINKS = {
  INSTAGRAM: 'https://instagram.com/deelaruze',
  EMAIL: 'contact@deelaruze.com',
};

// Validation
export const VALIDATION = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  MAX_IMAGES: 10,
  MIN_IMAGES: 3,
};