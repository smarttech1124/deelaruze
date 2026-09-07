import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { pageContentService } from '../../services/contentService';
import Loader from '../../components/common/Loader';

const Editor = lazy(() =>
  import('@tinymce/tinymce-react').then((m) => ({ default: m.Editor }))
);

// The pages whose headings / intro copy are admin-editable.
const PAGES = [
  { slug: 'roaring-records', label: 'Roaring Records' },
  { slug: 'stickers', label: 'Stickers' },
  { slug: 'collaborations', label: 'Collaborations' },
];

const EMPTY = { title: '', subtitle: '', description: '', imageAlt: '' };

const PageContentAdmin = () => {
  const [activeSlug, setActiveSlug] = useState(PAGES[0].slug);
  const [form, setForm] = useState(EMPTY);
  const [currentImage, setCurrentImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError('');
      setImageFile(null);

      try {
        const response = await pageContentService.get(activeSlug);
        if (!mounted) return;

        const page = response?.data;

        setForm({
          title: page?.title || '',
          subtitle: page?.subtitle || '',
          description: page?.description || '',
          imageAlt: page?.image?.alt || '',
        });
        setCurrentImage(page?.image?.url ? page.image : null);
      } catch (err) {
        console.error('Failed to load page content:', err);
        if (mounted) setError('Failed to load page content');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [activeSlug]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', form.title.trim());
      data.append('subtitle', form.subtitle.trim());
      data.append('description', form.description);
      data.append('imageAlt', form.imageAlt.trim());
      if (imageFile) data.append('image', imageFile);

      const response = await pageContentService.save(activeSlug, data);

      setCurrentImage(response?.data?.image?.url ? response.data.image : currentImage);
      setImageFile(null);
      setNotice('Page content saved');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to save page content');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black mb-1">PAGE CONTENT</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Edit the headings and intro copy shown at the top of each content page
          </p>
        </header>

        {/* Page selector */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-8" role="tablist">
          {PAGES.map((page) => (
            <button
              key={page.slug}
              type="button"
              role="tab"
              aria-selected={activeSlug === page.slug}
              onClick={() => setActiveSlug(page.slug)}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold transition-colors ${
                activeSlug === page.slug
                  ? 'bg-white text-black'
                  : 'border border-gray-700 hover:border-white'
              }`}
            >
              {page.label.toUpperCase()}
            </button>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 border border-red-600 bg-red-950/40 text-red-300 px-4 py-3 text-sm"
          >
            {error}
          </div>
        )}
        {notice && (
          <div
            role="status"
            className="mb-6 border border-green-600 bg-green-950/30 text-green-300 px-4 py-3 text-sm"
          >
            {notice}
          </div>
        )}

        {loading ? (
          <Loader size="lg" />
        ) : (
          <form onSubmit={handleSubmit} className="admin-panel space-y-6">
            <div>
              <label className="admin-label block" htmlFor="page-title">
                Page title
              </label>
              <input
                id="page-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={200}
                placeholder="Leave blank to use the default heading"
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label block" htmlFor="page-subtitle">
                Intro / subtitle
              </label>
              <input
                id="page-subtitle"
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                maxLength={300}
                placeholder="One-line intro shown under the heading"
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label block">Description</label>
              <Suspense
                fallback={<div className="text-gray-500 text-sm">Loading editor…</div>}
              >
                <Editor
                  apiKey={import.meta.env.VITE_TINYMCE_KEY}
                  value={form.description}
                  onEditorChange={(value) =>
                    setForm((prev) => ({ ...prev, description: value }))
                  }
                  init={{
                    height: 320,
                    menubar: false,
                    skin: 'oxide-dark',
                    content_css: 'dark',
                    plugins: 'lists link code',
                    toolbar:
                      'undo redo | bold italic underline | bullist numlist | link | code',
                    content_style: `
                      body {
                        background-color: black !important;
                        color: #ffffff !important;
                        font-family: inherit;
                      }
                      a { color: #60a5fa; }
                    `,
                  }}
                />
              </Suspense>
            </div>

            {/* Optional page image */}
            <div>
              <label className="admin-label block" htmlFor="page-image">
                Page image (optional)
              </label>
              <input
                type="file"
                id="page-image"
                accept="image/*"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="page-image"
                className="upload-zone cursor-pointer p-6 rounded text-center flex flex-col items-center gap-3 block border border-gray-800 hover:border-gray-600 transition-colors"
              >
                <ImageIcon className="w-10 h-10 text-gray-500" aria-hidden="true" />
                <span className="text-white font-bold">
                  {imageFile ? imageFile.name : 'Click to upload an image'}
                </span>
              </label>

              {(imageFile || currentImage?.url) && (
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : currentImage.url}
                  alt="Page image preview"
                  className="mt-4 w-40 h-28 object-cover border border-gray-800"
                />
              )}
            </div>

            <div>
              <label className="admin-label block" htmlFor="page-image-alt">
                Image alt text
              </label>
              <input
                id="page-image-alt"
                name="imageAlt"
                value={form.imageAlt}
                onChange={handleChange}
                placeholder="Describe the image for screen readers"
                className="admin-input"
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="admin-button-primary">
                {saving ? 'SAVING…' : 'SAVE CHANGES'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PageContentAdmin;
