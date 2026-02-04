import { VALIDATION } from './constants';

// Validate submission form
export const validateSubmissionForm = (formData, files) => {
  const errors = {};

  // Artist name
  if (!formData.artistName || formData.artistName.trim().length < 2) {
    errors.artistName = 'Artist name must be at least 2 characters';
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email || !emailRegex.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Description
  if (!formData.description || formData.description.trim().length < 50) {
    errors.description = 'Description must be at least 50 characters';
  }

  // Files
  if (files.length < VALIDATION.MIN_IMAGES) {
    errors.files = `Please upload at least ${VALIDATION.MIN_IMAGES} images`;
  } else if (files.length > VALIDATION.MAX_IMAGES) {
    errors.files = `Maximum ${VALIDATION.MAX_IMAGES} images allowed`;
  }

  // Validate each file
  files.forEach((file, index) => {
    if (file.size > VALIDATION.MAX_FILE_SIZE) {
      errors.files = `File ${index + 1} exceeds 10MB limit`;
    }
    if (!VALIDATION.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      errors.files = `File ${index + 1} is not a valid image format`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate contact form
export const validateContactForm = (formData) => {
  const errors = {};

  // Name
  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email || !emailRegex.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Message
  if (!formData.message || formData.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate newsletter email
export const validateNewsletterEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};