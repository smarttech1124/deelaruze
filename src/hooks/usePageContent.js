import { useEffect, useState } from 'react';
import { pageContentService } from '../services/contentService';

/**
 * Loads the admin-managed page-level copy (title, subtitle, description, image)
 * for a page, falling back to the supplied defaults until an admin sets it.
 */
export const usePageContent = (slug, defaults = {}) => {
  const [content, setContent] = useState(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await pageContentService.get(slug);
        if (!mounted) return;

        const page = response?.data;

        if (page) {
          // Blank admin fields fall back to the defaults rather than showing nothing.
          setContent({
            title: page.title || defaults.title || '',
            subtitle: page.subtitle || defaults.subtitle || '',
            description: page.description || defaults.description || '',
            image: page.image?.url ? page.image : defaults.image || null,
          });
        }
      } catch (error) {
        console.error(`Failed to load page content for "${slug}":`, error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return { content, loading };
};

export default usePageContent;
