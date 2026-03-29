import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GripVertical, Trash2, Image as ImageIcon, Upload, MapPin, User } from 'lucide-react';
import api from '../../services/api';

const SetFromTheStreet = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading]           = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    artist:      '',
    location:    '',
    description: '',
    status:      'draft',
    newImages:   [],
  });

  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // ── Fetch (edit mode) ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit) return;

    let mounted = true;

    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/fromthestreet/${id}`);
        const post = data.data;

        if (!mounted) return;

        setForm({
          artist:      post.artist      ?? '',
          location:    post.location    ?? '',
          description: post.description ?? '',
          status:      post.status      ?? 'draft',
          newImages:   [],
        });

        const sorted = [...(post.images ?? [])].sort((a, b) =>
          (a.order ?? 0) - (b.order ?? 0)
        );
        setExistingImages(sorted);

      } catch (err) {
        console.error(err);
        alert('Failed to load post');
        navigate('/admin/fromthestreet');
      }
    };

    fetchPost();
    return () => { mounted = false; };
  }, [id, isEdit, navigate]);

  // ── Generic field handler ──────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  // ── New image files ────────────────────────────────────────────────────────
  const handleImages = useCallback((e) => {
    setForm(prev => ({ ...prev, newImages: Array.from(e.target.files) }));
  }, []);

  // ── Remove a new (not-yet-uploaded) image from preview ─────────────────────
  const removeNewImage = useCallback((index) => {
    setForm(prev => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index),
    }));
  }, []);

  // ── Mark existing image for deletion ──────────────────────────────────────
  const handleDeleteExistingImage = useCallback((imageId) => {
    setImagesToDelete(prev => [...prev, imageId]);
  }, []);

  // Existing images that are NOT marked for deletion
  const visibleImages = existingImages.filter(
    img => !imagesToDelete.includes(img._id)
  );

  // ── Drag & drop reorder ────────────────────────────────────────────────────
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

    setExistingImages(prev => {
      const visible  = prev.filter(img => !imagesToDelete.includes(img._id));
      const deleted  = prev.filter(img =>  imagesToDelete.includes(img._id));
      const reordered = [...visible];
      const [moved]   = reordered.splice(draggedIndex, 1);
      reordered.splice(dropIndex, 0, moved);
      return [...reordered, ...deleted];
    });

    setDraggedIndex(null);
  }, [draggedIndex, imagesToDelete]);

  const handleDragEnd = useCallback(() => setDraggedIndex(null), []);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const data = new FormData();

      // Required fields
      data.append('artist',      form.artist.trim());
      data.append('location',    form.location.trim());
      data.append('description', form.description.trim());
      data.append('status',      form.status);

      // New image files
      form.newImages.forEach(file => data.append('images', file));

      // Edit-only: image order + deletions
      if (isEdit) {
        const imageOrder = visibleImages.map((img, idx) => ({
          id: img._id, order: idx,
        }));
        data.append('imageOrder',   JSON.stringify(imageOrder));

        if (imagesToDelete.length > 0) {
          data.append('deleteImages', JSON.stringify(imagesToDelete));
        }
      }

      if (isEdit) {
        await api.put(`/fromthestreet/${id}`, data);
      } else {
        await api.post('/fromthestreet', data);
      }

      navigate('/admin/fromthestreet');

    } catch (err) {
      console.error(err);

      if (err.response?.data?.errors) {
        err.response.data.errors.forEach(error =>
          alert(`${error.field}: ${error.message}`)
        );
      } else {
        alert(isEdit ? 'Failed to update post' : 'Failed to create post');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black mb-1">
            {isEdit ? 'EDIT POST' : 'NEW POST'}
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            {isEdit
              ? 'Update this from-the-street post. Drag images to reorder.'
              : 'Add a new from-the-street post.'}
          </p>
        </header>

        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── MAIN PANEL ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2 admin-panel space-y-6">

            {/* Artist */}
            <div>
              <label className="admin-label flex items-center gap-1.5">
                <User size={12} /> Artist
              </label>
              <input
                name="artist"
                value={form.artist}
                onChange={handleChange}
                placeholder="e.g. deelaruze"
                className="admin-input"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="admin-label flex items-center gap-1.5">
                <MapPin size={12} /> Location
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. UK, London"
                className="admin-input"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="admin-label">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={8}
                placeholder="Write something about this post…"
                className="admin-input resize-none"
                required
              />
            </div>

            {/* ── Image Upload ──────────────────────────────────────────── */}
            <div>
              <label className="admin-label flex items-center gap-1.5">
                <Upload size={12} />
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
                <ImageIcon className="w-10 h-10 text-gray-500" />
                <div>
                  <p className="text-white font-bold">Click to upload images</p>
                  <p className="text-gray-500 text-sm">JPG, PNG, WEBP accepted</p>
                </div>
                {form.newImages.length > 0 && (
                  <p className="text-green-400 text-sm font-bold">
                    {form.newImages.length} file(s) selected
                  </p>
                )}
              </label>

              {/* New-image preview strip */}
              {form.newImages.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {form.newImages.map((file, i) => (
                    <div key={i} className="image-card relative h-28 rounded overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`new-${i}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="delete-button"
                        title="Remove"
                      >
                        <Trash2 size={14} className="text-white" />
                      </button>
                      <div className="image-overlay" />
                      <div className="image-number">NEW</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Existing Images (edit mode) ───────────────────────────── */}
            {isEdit && visibleImages.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="admin-label">
                    Existing Images ({visibleImages.length})
                  </label>
                  <p className="text-xs text-gray-500">
                    Drag to reorder · × to remove
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {visibleImages.map((img, idx) => (
                    <div
                      key={img._id || idx}
                      draggable
                      onDragStart={e => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={e => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`image-card relative h-48 rounded overflow-hidden ${draggedIndex === idx ? 'dragging' : ''}`}
                    >
                      <div className="drag-handle">
                        <GripVertical size={16} className="text-white" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img._id)}
                        className="delete-button"
                        title="Delete image"
                      >
                        <Trash2 size={16} className="text-white" />
                      </button>
                      <img
                        src={img.url}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                      <div className="image-overlay" />
                      <div className="image-number">#{idx + 1}</div>
                    </div>
                  ))}
                </div>

                {imagesToDelete.length > 0 && (
                  <p className="text-yellow-500 text-sm mt-4 flex items-center gap-2">
                    <Trash2 size={14} />
                    {imagesToDelete.length} image(s) marked for deletion — confirmed on save.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
          <div className="admin-panel space-y-6 h-fit">
            <div>
              <label className="admin-label">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="admin-input"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Quick info summary */}
            <div className="border border-white/5 rounded p-4 space-y-3">
              <p className="admin-label mb-0">Summary</p>
              <div className="text-sm text-gray-400 space-y-1">
                <p>
                  <span className="text-gray-600">Artist: </span>
                  {form.artist || <span className="italic text-gray-700">—</span>}
                </p>
                <p>
                  <span className="text-gray-600">Location: </span>
                  {form.location || <span className="italic text-gray-700">—</span>}
                </p>
                <p>
                  <span className="text-gray-600">Images: </span>
                  {visibleImages.length + form.newImages.length}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button type="submit" disabled={loading} className="admin-button-primary w-full">
                {loading
                  ? (isEdit ? 'UPDATING…' : 'PUBLISHING…')
                  : (isEdit ? 'UPDATE'     : 'PUBLISH')}
              </button>
              <button
                type="button"
                className="admin-button-outline w-full"
                onClick={() => navigate('/admin/fromthestreet')}
              >
                CANCEL
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SetFromTheStreet;