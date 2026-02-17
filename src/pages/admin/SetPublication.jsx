import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const Editor = lazy(() =>
  import('@tinymce/tinymce-react').then(m => ({ default: m.Editor }))
);

const NewPublication = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    tagline: '',
    pages: '',
    slug: '',
    price: '',
    stock: '',
    description: '',
    contributors: '',
    featured: false,
    status: 'draft',
    newImages: []
  });
  const [existingImages, setExistingImages] = useState([]);

  // ===============================
  // Fetch publication (edit mode)
  // ===============================
  useEffect(() => {
    if (!isEdit) return;

    let mounted = true;

    const fetchPublication = async () => {
      try {
        const { data } = await api.get(`/publications/${id}`);
        const pub = data.data;

        if (!mounted) return;

        setForm({
          title: pub.title ?? '',
          tagline: pub.tagline ?? '',
          pages: pub.pages ?? '',
          slug: pub.slug ?? '',
          price: pub.price ?? '',
          stock: pub.stock ?? '',
          description: pub.description ?? '',
          contributors: pub.contributors ?? '',
          featured: pub.featured ?? false,
          status: pub.status ?? 'draft',
          newImages: []
        });

        setExistingImages(pub.images ?? []);

      } catch (err) {
        console.error(err);
        alert('Failed to load publication');
        navigate('/admin/publications');
      }
    };

    fetchPublication();

    return () => {
      mounted = false;
    };
  }, [id, isEdit, navigate]);

  // ===============================
  // Handlers
  // ===============================

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    setForm(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      if (name === 'title') {
        updated.slug = value
          .toLowerCase()
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-');
      }

      return updated;
    });
  }, []);


  const handleImages = useCallback((e) => {
    setForm(prev => ({
      ...prev,
      newImages: Array.from(e.target.files)
    }));
  }, []);


  const handleEditorChange = useCallback((value) => {
    setForm(prev => ({
      ...prev,
      description: value
    }));
  }, []);

  const handleEditorContributors = useCallback((value) => {
    setForm(prev => ({
      ...prev,
      contributors: value
    }));
  }, []);

  // ===============================
  // Submit
  // ===============================

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const data = new FormData();

      // ===============================
      // REQUIRED FIELDS WITH DEFAULTS
      // ===============================
      data.append('title', form.title.trim() || '');
      data.append('description', form.description.trim() || '');
      data.append('price', Number(form.price) || 0);
      data.append('stock', Number(form.stock) || 0);
      data.append('category', form.category || ''); // Must match backend allowed values

      // ===============================
      // OPTIONAL FIELDS
      // ===============================
      data.append('slug', form.slug.trim() || '');
      data.append('tagline', form.tagline.trim() || '');
      data.append('pages', form.pages || '');
      data.append('status', form.status || 'draft');
      data.append('featured', form.featured);
      data.append('contributors', form.contributors || '');
      
      // ===============================
      // IMAGES
      // ===============================
      if (form.newImages && form.newImages.length > 0) {
        form.newImages.forEach(file => data.append('images', file));
      }
      
      // ===============================
      // SEND REQUEST
      // ===============================
      if (isEdit) {
        await api.put(`/publications/${id}`, data);
      } else {
        await api.post('/publications', data);
      }

      // Navigate back to publications list
      navigate('/admin/publications');

    } catch (err) {
      console.error(err);

      // Backend validation errors
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach(error =>
          alert(`${error.field}: ${error.message}`)
        );
      } else {
        alert(isEdit ? 'Failed to update publication' : 'Failed to publish');
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">

        <header>
          <h1 className="text-5xl font-black">
            {isEdit ? 'EDIT PUBLICATION' : 'NEW PUBLICATION'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isEdit
              ? 'Update this publication.'
              : 'Add a new release to the archive.'}
          </p>
        </header>

        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* MAIN */}
          <div className="lg:col-span-2 admin-panel space-y-6">

            <div>
              <label className="admin-label">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="admin-input"
                required
              />
            </div>
            
            <div>
              <label className="admin-label">Description</label>
              <Suspense fallback={<div>Loading editor...</div>}>
                <Editor
                  apiKey={import.meta.env.VITE_TINYMCE_KEY}
                  value={form.description}
                  onEditorChange={handleEditorChange}
                  init={{
                    height: 350,
                    menubar: false,
                    skin: "oxide-dark",         
                    content_css: "dark",         
                    plugins: "lists link image",
                    toolbar:
                      "bold italic",
                    content_style: `
                      body {
                        background-color: black !important;
                        color: #ffffff !important;
                        font-family: inherit;
                      }

                      a { color: #60a5fa; }
                    `
                  }}
                />
              </Suspense>
            </div>

            <div>
              <label className="admin-label">Contributors</label>
              
              <Suspense fallback={<div>Loading editor...</div>}>
                <Editor
                  apiKey={import.meta.env.VITE_TINYMCE_KEY}
                  value={form.contributors}
                  onEditorChange={handleEditorContributors}
                  init={{
                    height: 200,
                    menubar: false,
                    skin: "oxide-dark",         
                    content_css: "dark",         
                    plugins: "lists link image",
                    toolbar:
                      "bold italic",
                    content_style: `
                      body {
                        background-color: black !important;
                        color: #ffffff !important;
                        font-family: inherit;
                      }

                      a { color: #60a5fa; }
                    `
                  }}
                />
              </Suspense>
            </div>

            <div>
              <label className="admin-label">
                {isEdit ? 'Add More Images' : 'Images'}
              </label>
              <input type="file" multiple onChange={handleImages} />
            </div>
            {isEdit && existingImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                {existingImages.map((img, idx) => (
                  <img
                    key={img._id || idx}
                    src={img.url}
                    alt={`${img._id}-${idx}`}
                    className="
                      h-36
                      w-full
                      aspect-[3/4]
                      object-cover
                      rounded
                      border border-gray-800
                      hover:opacity-90
                      transition
                    "
                  />
                ))}
              </div>
            )}


          </div>

          {/* META */}
          <div className="admin-panel space-y-6">

            <div>
              <label className="admin-label">Title Tagline</label>
              <input
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Volume Pages</label>
              <input
                name="pages"
                value={form.pages}
                onChange={handleChange}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Slug</label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Price</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Stock</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="admin-input"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="admin-label">Featured</span>
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
                onChange={handleChange}
              />
            </div>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="admin-input"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>

            <div className="flex items-center justify-around">
              <button
                type="button"
                className="admin-button-outline"
                onClick={() => navigate('/admin/publications')}
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="admin-button-primary"
              >
                {loading
                  ? isEdit ? 'UPDATING…' : 'PUBLISHING…'
                  : isEdit ? 'UPDATE' : 'PUBLISH'}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPublication;
