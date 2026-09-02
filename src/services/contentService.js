import api from './api';

/**
 * Every admin-managed content type shares the same REST surface, so the
 * client for each one is generated from a single factory.
 *
 * Create/update take a FormData instance (image upload + text fields).
 */
const createContentService = (resource) => ({
  // Published entries, in the admin-defined order
  getAll: async () => {
    const response = await api.get(`/${resource}`);
    return response.data;
  },

  // Every entry including drafts (admin only)
  getAllAdmin: async () => {
    const response = await api.get(`/${resource}/all`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/${resource}/${id}`);
    return response.data;
  },

  create: async (formData) => {
    const response = await api.post(`/${resource}`, formData);
    return response.data;
  },

  update: async (id, formData) => {
    const response = await api.put(`/${resource}/${id}`, formData);
    return response.data;
  },

  setStatus: async (id, status) => {
    const response = await api.patch(`/${resource}/${id}/status`, { status });
    return response.data;
  },

  // items: [{ id, order }]
  reorder: async (items) => {
    const response = await api.patch(`/${resource}/reorder`, { items });
    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/${resource}/${id}`);
    return response.data;
  },
});

export const roaringRecordService = createContentService('roaring-records');
export const stickerService = createContentService('stickers');
export const collaborationService = createContentService('collaborations');
export const heroSlideService = createContentService('hero-slides');

export const pageContentService = {
  get: async (slug) => {
    const response = await api.get(`/page-content/${slug}`);
    return response.data;
  },

  save: async (slug, formData) => {
    const response = await api.put(`/page-content/${slug}`, formData);
    return response.data;
  },
};

export default createContentService;
