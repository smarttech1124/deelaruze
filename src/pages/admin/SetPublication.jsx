import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, GripVertical, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import api from '../../services/api';

const Editor = lazy(() =>
  import('@tinymce/tinymce-react').then(m => ({ default: m.Editor }))
);

const NewPublication = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

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
  const [imagesToDelete, setImagesToDelete] = useState([]);

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

        // Sort images by order field if it exists, otherwise maintain array order
        const sortedImages = (pub.images ?? []).sort((a, b) => {
          // If both have order field, sort by order
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          // If only one has order, prioritize it
          if (a.order !== undefined) return -1;
          if (b.order !== undefined) return 1;
          // If neither has order, maintain current order
          return 0;
        });

        setExistingImages(sortedImages);

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
  // Image Management
  // ===============================

  const handleDeleteExistingImage = useCallback((imageId, index) => {
    // Mark image for deletion but keep it in state until save
    setImagesToDelete(prev => [...prev, imageId]);
  }, []);

  // Filter out images marked for deletion when displaying
  const visibleImages = existingImages.filter(
    img => !imagesToDelete.includes(img._id)
  );

  const handleDragStart = useCallback((e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    // Work with the full existingImages array, not filtered
    setExistingImages(prev => {
      // Get only visible images (not marked for deletion)
      const visible = prev.filter(img => !imagesToDelete.includes(img._id));
      
      // Reorder the visible images
      const newImages = [...visible];
      const [draggedImage] = newImages.splice(draggedIndex, 1);
      newImages.splice(dropIndex, 0, draggedImage);
      
      // Merge back with any images marked for deletion (to preserve them until save)
      const deleted = prev.filter(img => imagesToDelete.includes(img._id));
      return [...newImages, ...deleted];
    });

    setDraggedIndex(null);
  }, [draggedIndex, imagesToDelete]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
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
      data.append('category', form.category || '');

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

      // Send image order with updated indices (only for non-deleted images)
      if (isEdit && existingImages.length > 0) {
        // Filter out deleted images before sending order
        const visibleImages = existingImages.filter(
          img => !imagesToDelete.includes(img._id)
        );
        
        // Create array of objects with image ID and new order index
        const imageOrder = visibleImages.map((img, index) => ({
          id: img._id,
          order: index
        }));
        data.append('imageOrder', JSON.stringify(imageOrder));
      }

      // Send images to delete
      if (isEdit && imagesToDelete.length > 0) {
        data.append('deleteImages', JSON.stringify(imagesToDelete));
      }
      
      // ===============================
      // SEND REQUEST
      // ===============================
      if (isEdit) {
        await api.put(`/publications/${id}`, data);
      } else {
        await api.post('/publications', data);
      }

      navigate('/admin/publications');

    } catch (err) {
      console.error(err);

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&display=swap');

        .admin-title {
          font-family: 'Archivo Black', sans-serif;
          letter-spacing: -0.02em;
        }

        .image-card {
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: grab;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .image-card:active {
          cursor: grabbing;
        }

        .image-card:hover {
          border-color: rgba(255, 51, 102, 0.5);
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(255, 51, 102, 0.2);
        }

        .image-card.dragging {
          opacity: 0.5;
          transform: scale(0.95);
        }

        .image-card.drag-over {
          border-color: #FF3366;
          background: rgba(255, 51, 102, 0.1);
        }

        .delete-button {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 51, 102, 0.5);
          padding: 8px;
          border-radius: 4px;
          opacity: 0;
          transition: all 0.3s;
          z-index: 10;
        }

        .image-card:hover .delete-button {
          opacity: 1;
        }

        .delete-button:hover {
          background: #FF3366;
          border-color: #FF3366;
          transform: scale(1.1);
        }

        .drag-handle {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px;
          border-radius: 4px;
          opacity: 0;
          transition: all 0.3s;
          cursor: grab;
          z-index: 10;
        }

        .image-card:hover .drag-handle {
          opacity: 1;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .image-card:hover .image-overlay {
          opacity: 1;
        }

        .image-number {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(255, 51, 102, 0.9);
          color: white;
          font-weight: bold;
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: 'Space Mono', monospace;
        }

        .upload-zone {
          border: 2px dashed rgba(255, 255, 255, 0.2);
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .upload-zone:hover {
          border-color: rgba(255, 51, 102, 0.5);
          background: rgba(255, 51, 102, 0.05);
        }

        .upload-zone::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 51, 102, 0.1), rgba(0, 255, 148, 0.1));
          opacity: 0;
          transition: opacity 0.3s;
        }

        .upload-zone:hover::before {
          opacity: 1;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="admin-title text-5xl md:text-6xl mb-2">
            {isEdit ? 'EDIT PUBLICATION' : 'NEW PUBLICATION'}
          </h1>
          <p className="text-gray-500">
            {isEdit
              ? 'Update this publication. Drag images to reorder.'
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
                    toolbar: "bold italic",
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
                    toolbar: "bold italic",
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
              <label className="admin-label flex items-center gap-2">
                <Upload size={16} />
                {isEdit ? 'Add More Images' : 'Images'}
              </label>
              <input 
                type="file" 
                multiple 
                onChange={handleImages}
                className="hidden"
                id="image-upload"
                accept="image/*"
              />
              <label 
                htmlFor="image-upload" 
                className="upload-zone cursor-pointer p-6 rounded text-center flex flex-col items-center gap-3 block"
              >
                <ImageIcon className="w-12 h-12 text-gray-500" />
                <div>
                  <p className="text-white font-bold">Click to upload images</p>
                  <p className="text-gray-500 text-sm">or drag and drop</p>
                </div>
                {form.newImages.length > 0 && (
                  <p className="text-green-500 text-sm font-bold">
                    {form.newImages.length} file(s) selected
                  </p>
                )}
              </label>
            </div>

            {/* Existing Images with Drag & Drop */}
            {isEdit && visibleImages.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="admin-label">
                    Existing Images ({visibleImages.length})
                  </label>
                  <p className="text-xs text-gray-500">
                    Drag to reorder • Click × to delete
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {visibleImages.map((img, idx) => (
                    <div
                      key={img._id || idx}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`
                        image-card
                        relative
                        h-48
                        rounded
                        overflow-hidden
                        ${draggedIndex === idx ? 'dragging' : ''}
                      `}
                    >
                      {/* Drag Handle */}
                      <div className="drag-handle">
                        <GripVertical size={16} className="text-white" />
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img._id, idx)}
                        className="delete-button"
                        title="Delete image"
                      >
                        <Trash2 size={16} className="text-white" />
                      </button>

                      {/* Image */}
                      <img
                        src={img.url}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />

                      {/* Overlay */}
                      <div className="image-overlay" />

                      {/* Image Number */}
                      <div className="image-number">
                        #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
                {imagesToDelete.length > 0 && (
                  <p className="text-yellow-500 text-sm mt-4 flex items-center gap-2">
                    <Trash2 size={14} />
                    {imagesToDelete.length} image(s) marked for deletion. Click UPDATE to confirm.
                  </p>
                )}
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