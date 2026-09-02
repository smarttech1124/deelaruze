import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
  X,
} from 'lucide-react';
import Loader from '../common/Loader';

/**
 * Generic admin CRUD screen for the image-led content types
 * (roaring records, stickers, collaborations, hero slides).
 *
 * Every type shares the same needs — create, edit, reorder, publish/unpublish,
 * delete, single image upload — so the screen is configured rather than copied.
 *
 * @param {Object}   service         client from services/contentService
 * @param {Array}    fields          [{ name, label, type, required, ... }]
 * @param {string}   primaryField    field shown as the row heading
 * @param {string}   [secondaryField] field shown under the heading
 * @param {Object}   [secondaryImage] { name, label, help } optional 2nd image
 * @param {boolean}  [multiUpload]   enable "bulk add" (one entry per file)
 */
const ContentCollectionManager = ({
  title,
  description,
  itemLabel = 'item',
  service,
  fields,
  primaryField,
  secondaryField,
  imageLabel = 'Artwork',
  secondaryImage = null,
  multiUpload = false,
  bulkTitleFromFilename = true,
  bulkAltText = '',
  gallery = null,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // null = closed, {} = creating, item = editing
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [secondaryFile, setSecondaryFile] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [bulkProgress, setBulkProgress] = useState(null); // { done, total }

  // Gallery mode (several images per entry)
  const galleryField = gallery?.field || 'images';
  const minImages = gallery?.min ?? 1;
  const maxImages = gallery?.max ?? 5;

  const [galleryFiles, setGalleryFiles] = useState([]);   // newly picked files
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [draggedImage, setDraggedImage] = useState(null);

  // Images already saved that are not marked for removal
  const keptImages = existingImages.filter(
    (img) => !imagesToDelete.includes(img._id)
  );
  const totalImages = keptImages.length + galleryFiles.length;

  const emptyForm = useMemo(() => {
    const base = { status: 'draft', imageAlt: '' };
    fields.forEach((field) => {
      base[field.name] = field.defaultValue ?? '';
    });
    return base;
  }, [fields]);

  /* ----------------------------- Data ----------------------------- */

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await service.getAllAdmin();
      setItems(response.data || []);
      setError('');
    } catch (err) {
      console.error(`Error loading ${itemLabel}s:`, err);
      setError(`Failed to load ${itemLabel}s`);
    } finally {
      setLoading(false);
    }
  }, [service, itemLabel]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 3000);
  };

  const apiError = (err, fallback) =>
    err?.response?.data?.message || err?.message || fallback;

  /* ----------------------------- Form ----------------------------- */

  const resetImageState = () => {
    setImageFile(null);
    setSecondaryFile(null);
    setGalleryFiles([]);
    setExistingImages([]);
    setImagesToDelete([]);
  };

  const openCreate = () => {
    setForm({ ...emptyForm });
    resetImageState();
    setError('');
    setEditing({});
  };

  const openEdit = (item) => {
    const next = { status: item.status || 'draft', imageAlt: item.image?.alt || '' };
    fields.forEach((field) => {
      next[field.name] = item[field.name] ?? field.defaultValue ?? '';
    });

    setForm(next);
    resetImageState();

    if (gallery) {
      setExistingImages(item[galleryField] || []);
      // Alt text is shared across an entry's images.
      next.imageAlt = item[galleryField]?.[0]?.alt || '';
      setForm({ ...next });
    }

    setError('');
    setEditing(item);
  };

  const closeForm = useCallback(() => {
    setEditing(null);
    setImageFile(null);
    setSecondaryFile(null);
    setGalleryFiles([]);
    setExistingImages([]);
    setImagesToDelete([]);
  }, []);

  // While the dialog is open, hold the page still behind it and let Escape close it.
  useEffect(() => {
    if (!editing) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (event) => {
      if (event.key === 'Escape') closeForm();
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [editing, closeForm]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* --------------------------- Gallery images ---------------------------- */

  const addGalleryFiles = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = '';
    if (picked.length === 0) return;

    const room = maxImages - totalImages;

    if (room <= 0) {
      setError(`You can upload at most ${maxImages} images`);
      return;
    }

    if (picked.length > room) {
      setError(`Only ${room} more image(s) can be added — the rest were ignored`);
    } else {
      setError('');
    }

    setGalleryFiles((prev) => [...prev, ...picked.slice(0, room)]);
  };

  const removeGalleryFile = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setError('');
  };

  const markImageForDeletion = (imageId) => {
    setImagesToDelete((prev) => [...prev, imageId]);
    setError('');
  };

  const restoreImage = (imageId) => {
    setImagesToDelete((prev) => prev.filter((id) => id !== imageId));
  };

  // Drag to reorder the already-saved images
  const handleImageDrop = (event, dropIndex) => {
    event.preventDefault();

    if (draggedImage === null || draggedImage === dropIndex) {
      setDraggedImage(null);
      return;
    }

    setExistingImages((prev) => {
      const kept = prev.filter((img) => !imagesToDelete.includes(img._id));
      const removed = prev.filter((img) => imagesToDelete.includes(img._id));
      const reordered = [...kept];
      const [moved] = reordered.splice(draggedImage, 1);
      reordered.splice(dropIndex, 0, moved);
      return [...reordered, ...removed];
    });

    setDraggedImage(null);
  };

  const isEditing = Boolean(editing && editing._id);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    if (gallery) {
      if (totalImages < minImages) {
        setError(
          `At least ${minImages} image${minImages === 1 ? ' is' : 's are'} required`
        );
        return;
      }
      if (totalImages > maxImages) {
        setError(`No more than ${maxImages} images are allowed`);
        return;
      }
    } else if (!isEditing && !imageFile) {
      setError('An image is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const data = new FormData();

      fields.forEach((field) => {
        data.append(field.name, (form[field.name] ?? '').toString().trim());
      });
      data.append('status', form.status);
      data.append('imageAlt', (form.imageAlt ?? '').trim());

      if (gallery) {
        galleryFiles.forEach((file) => data.append(galleryField, file));

        if (isEditing) {
          data.append(
            'imageOrder',
            JSON.stringify(keptImages.map((img, index) => ({ id: img._id, order: index })))
          );

          if (imagesToDelete.length > 0) {
            data.append('deleteImages', JSON.stringify(imagesToDelete));
          }
        }
      } else {
        if (imageFile) data.append('image', imageFile);
        if (secondaryImage && secondaryFile) {
          data.append(secondaryImage.name, secondaryFile);
        }
      }

      if (isEditing) {
        await service.update(editing._id, data);
      } else {
        await service.create(data);
      }

      closeForm();
      await loadItems();
      flash(isEditing ? 'Changes saved' : `${itemLabel} created`);
    } catch (err) {
      console.error(err);
      setError(apiError(err, `Failed to save ${itemLabel}`));
    } finally {
      setSaving(false);
    }
  };

  /* --------------------------- Bulk upload ------------------------- */

  const handleBulkUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length === 0) return;

    setSaving(true);
    setError('');
    setBulkProgress({ done: 0, total: files.length });

    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const data = new FormData();
        // Filename (minus extension) seeds the name — editable afterwards.
        const name = file.name.replace(/\.[^.]+$/, '');

        if (bulkTitleFromFilename && fields.some((field) => field.name === 'title')) {
          data.append('title', name);
        }
        data.append('status', 'draft');
        data.append('imageAlt', bulkAltText || name);
        data.append('image', file);

        await service.create(data);
        setBulkProgress({ done: index + 1, total: files.length });
      }

      await loadItems();
      flash(`${files.length} file(s) uploaded as drafts`);
    } catch (err) {
      console.error(err);
      setError(apiError(err, 'Bulk upload failed'));
    } finally {
      setSaving(false);
      setBulkProgress(null);
    }
  };

  /* ---------------------------- Actions ---------------------------- */

  const toggleStatus = async (item) => {
    setBusyId(item._id);
    const next = item.status === 'published' ? 'draft' : 'published';

    try {
      await service.setStatus(item._id, next);
      setItems((prev) =>
        prev.map((entry) =>
          entry._id === item._id ? { ...entry, status: next } : entry
        )
      );
      flash(next === 'published' ? 'Published' : 'Unpublished');
    } catch (err) {
      setError(apiError(err, 'Failed to update status'));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item) => {
    const name = item[primaryField] || `this ${itemLabel}`;
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setBusyId(item._id);

    try {
      await service.remove(item._id);
      setItems((prev) => prev.filter((entry) => entry._id !== item._id));
      flash(`${itemLabel} deleted`);
    } catch (err) {
      setError(apiError(err, `Failed to delete ${itemLabel}`));
    } finally {
      setBusyId(null);
    }
  };

  const persistOrder = async (ordered) => {
    setItems(ordered);

    try {
      await service.reorder(ordered.map((item, index) => ({ id: item._id, order: index })));
    } catch (err) {
      setError(apiError(err, 'Failed to save the new order'));
      loadItems();
    }
  };

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const ordered = [...items];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    persistOrder(ordered);
  };

  /* --------------------------- Drag & drop ------------------------- */

  const handleDragStart = (event, index) => {
    setDraggedIndex(index);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event, dropIndex) => {
    event.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const ordered = [...items];
    const [moved] = ordered.splice(draggedIndex, 1);
    ordered.splice(dropIndex, 0, moved);

    setDraggedIndex(null);
    persistOrder(ordered);
  };

  /* ----------------------------- Render ---------------------------- */

  // The image shown in the admin list: the single image, or a gallery's cover.
  const coverOf = (item) =>
    gallery ? item[galleryField]?.[0] || null : item.image?.url ? item.image : null;

  const StatusBadge = ({ status }) => (
    <span
      className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded ${
        status === 'published' ? 'bg-green-600' : 'bg-yellow-600'
      }`}
    >
      {(status || 'draft').toUpperCase()}
    </span>
  );

  const renderField = (field) => {
    const value = form[field.name] ?? '';

    if (field.type === 'textarea') {
      return (
        <textarea
          id={`field-${field.name}`}
          name={field.name}
          value={value}
          onChange={handleChange}
          rows={field.rows || 6}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          required={field.required}
          className="admin-input resize-none"
        />
      );
    }

    if (field.type === 'select') {
      return (
        <select
          id={`field-${field.name}`}
          name={field.name}
          value={value}
          onChange={handleChange}
          className="admin-input"
        >
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'color') {
      return (
        <div className="flex items-center gap-3">
          <input
            type="color"
            aria-label={`${field.label} colour picker`}
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#FF3366'}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, [field.name]: event.target.value }))
            }
            className="h-11 w-14 bg-black border border-gray-800 cursor-pointer"
          />
          <input
            id={`field-${field.name}`}
            name={field.name}
            value={value}
            onChange={handleChange}
            placeholder="#FF3366"
            className="admin-input flex-1"
          />
        </div>
      );
    }

    return (
      <input
        id={`field-${field.name}`}
        name={field.name}
        value={value}
        onChange={handleChange}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        required={field.required}
        className="admin-input"
      />
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black mb-1">{title}</h1>
            <p className="text-gray-400 text-sm sm:text-base">{description}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {multiUpload && (
              <>
                <input
                  type="file"
                  id="bulk-upload"
                  multiple
                  accept="image/*"
                  disabled={saving}
                  onChange={handleBulkUpload}
                  className="hidden"
                />
                <label
                  htmlFor="bulk-upload"
                  aria-disabled={saving}
                  className={`admin-button-outline flex items-center justify-center gap-2 ${
                    saving ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
                  }`}
                >
                  {bulkProgress ? (
                    <>
                      <span
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                        aria-hidden="true"
                      />
                      UPLOADING {bulkProgress.done}/{bulkProgress.total}
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      BULK UPLOAD
                    </>
                  )}
                </label>
              </>
            )}

            <button
              type="button"
              onClick={openCreate}
              className="admin-button-primary flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              NEW {itemLabel.toUpperCase()}
            </button>
          </div>
        </div>

        {/* ── Messages ───────────────────────────────────────────────── */}
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

        {bulkProgress && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 border border-gray-700 bg-gray-900 px-4 py-3"
          >
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-bold">
                Uploading {bulkProgress.done} of {bulkProgress.total}…
              </span>
              <span className="text-gray-500">
                {Math.round((bulkProgress.done / bulkProgress.total) * 100)}%
              </span>
            </div>
            <div className="h-1 w-full bg-gray-800">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{
                  width: `${(bulkProgress.done / bulkProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* ── List ───────────────────────────────────────────────────── */}
        {loading ? (
          <Loader size="lg" />
        ) : items.length === 0 ? (
          <div className="text-center py-16 sm:py-20 border border-gray-800">
            <ImageIcon className="w-10 h-10 mx-auto mb-4 text-gray-700" aria-hidden="true" />
            <p className="text-xl sm:text-2xl text-gray-400 mb-4">
              No {itemLabel}s yet
            </p>
            <button type="button" onClick={openCreate} className="admin-button-primary">
              Create your first {itemLabel}
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-4">
              Drag rows (or use the arrows) to set the order shown on the site.
            </p>

            <div className="grid gap-4">
              {items.map((item, index) => (
                <div
                  key={item._id}
                  draggable
                  onDragStart={(event) => handleDragStart(event, index)}
                  onDragOver={handleDragOver}
                  onDrop={(event) => handleDrop(event, index)}
                  onDragEnd={() => setDraggedIndex(null)}
                  className={`bg-gray-900 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 transition-colors hover:bg-gray-800 ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  {/* Order controls */}
                  <div className="flex sm:flex-col items-center justify-start gap-1 flex-shrink-0">
                    <GripVertical
                      size={18}
                      className="text-gray-600 cursor-grab hidden sm:block"
                      aria-hidden="true"
                    />
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="p-1 border border-gray-700 hover:border-white disabled:opacity-30 disabled:hover:border-gray-700"
                      aria-label={`Move ${item[primaryField] || itemLabel} up`}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <span className="text-xs text-gray-600 w-6 text-center">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === items.length - 1}
                      className="p-1 border border-gray-700 hover:border-white disabled:opacity-30 disabled:hover:border-gray-700"
                      aria-label={`Move ${item[primaryField] || itemLabel} down`}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  {/* Thumbnail — cover image, with a count when there are more */}
                  <div className="relative w-full sm:w-28 h-48 sm:h-28 bg-gray-800 flex-shrink-0 overflow-hidden">
                    {coverOf(item) ? (
                      <>
                        <img
                          src={coverOf(item).url}
                          alt={coverOf(item).alt || item[primaryField] || ''}
                          className="w-full h-full object-cover"
                        />
                        {gallery && (item[galleryField]?.length || 0) > 1 && (
                          <span className="absolute top-1.5 right-1.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            +{item[galleryField].length - 1}
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <h3 className="text-lg sm:text-xl font-black break-words">
                        {item[primaryField] || (
                          <span className="italic text-gray-600">Untitled</span>
                        )}
                      </h3>
                      <StatusBadge status={item.status} />
                    </div>

                    {secondaryField && item[secondaryField] && (
                      <p className="text-gray-400 text-xs sm:text-sm mb-2 break-words">
                        {item[secondaryField]}
                      </p>
                    )}

                    {item.description && (
                      <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 break-words">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 sm:gap-3 justify-end flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleStatus(item)}
                      disabled={busyId === item._id}
                      className="p-2 sm:p-3 border border-gray-700 hover:border-white transition-colors disabled:opacity-50"
                      title={item.status === 'published' ? 'Unpublish' : 'Publish'}
                      aria-label={
                        item.status === 'published'
                          ? `Unpublish ${item[primaryField] || itemLabel}`
                          : `Publish ${item[primaryField] || itemLabel}`
                      }
                    >
                      {item.status === 'published' ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="p-2 sm:p-3 border border-gray-700 hover:border-white transition-colors"
                      title="Edit"
                      aria-label={`Edit ${item[primaryField] || itemLabel}`}
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={busyId === item._id}
                      className="p-2 sm:p-3 border border-red-600 hover:bg-red-600 transition-colors disabled:opacity-50"
                      title="Delete"
                      aria-label={`Delete ${item[primaryField] || itemLabel}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Create / edit dialog ─────────────────────────────────────── */}
      {editing && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={`${isEditing ? 'Edit' : 'New'} ${itemLabel}`}
        >
          <div className="flex min-h-full items-center justify-center p-4 py-8">
            <form
              onSubmit={handleSubmit}
              className="admin-panel w-full max-w-2xl space-y-6"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-black">
                  {isEditing ? `EDIT ${itemLabel.toUpperCase()}` : `NEW ${itemLabel.toUpperCase()}`}
                </h2>
                <button
                  type="button"
                  onClick={closeForm}
                  className="p-2 border border-gray-700 hover:border-white transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {error && (
                <div
                  role="alert"
                  className="border border-red-600 bg-red-950/40 text-red-300 px-4 py-3 text-sm"
                >
                  {error}
                </div>
              )}

              {fields.map((field) => (
                <div key={field.name}>
                  <label className="admin-label block" htmlFor={`field-${field.name}`}>
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                  {renderField(field)}
                  {field.help && (
                    <p className="text-xs text-gray-600 mt-1">{field.help}</p>
                  )}
                </div>
              ))}

              {/* Gallery images (1–max per entry) */}
              {gallery ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="admin-label block mb-0" htmlFor="gallery-images">
                      {imageLabel}
                      <span className="text-red-500"> *</span>
                    </label>
                    <span
                      className={`text-xs font-bold ${
                        totalImages > maxImages || totalImages < minImages
                          ? 'text-red-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {totalImages} / {maxImages}
                    </span>
                  </div>

                  <input
                    type="file"
                    id="gallery-images"
                    accept="image/*"
                    multiple
                    disabled={totalImages >= maxImages}
                    onChange={addGalleryFiles}
                    className="hidden"
                  />
                  <label
                    htmlFor="gallery-images"
                    className={`upload-zone p-6 rounded text-center flex flex-col items-center gap-3 block border border-gray-800 transition-colors ${
                      totalImages >= maxImages
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer hover:border-gray-600'
                    }`}
                  >
                    <ImageIcon className="w-10 h-10 text-gray-500" aria-hidden="true" />
                    <div>
                      <p className="text-white font-bold">
                        {totalImages >= maxImages
                          ? `Maximum of ${maxImages} images reached`
                          : 'Click to add images'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {minImages}–{maxImages} images · JPG, PNG, WEBP or GIF · max 10MB each
                      </p>
                    </div>
                  </label>

                  {/* Saved images — drag to reorder, × to remove */}
                  {keptImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">
                        Saved images — drag to reorder · the first is the cover
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {keptImages.map((img, index) => (
                          <div
                            key={img._id || index}
                            draggable
                            onDragStart={(event) => {
                              setDraggedImage(index);
                              event.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => handleImageDrop(event, index)}
                            onDragEnd={() => setDraggedImage(null)}
                            className={`relative h-24 border border-gray-800 overflow-hidden group ${
                              draggedImage === index ? 'opacity-50' : ''
                            }`}
                          >
                            <img
                              src={img.url}
                              alt={img.alt || `Artwork ${index + 1}`}
                              className="w-full h-full object-cover"
                              draggable={false}
                            />
                            <span className="absolute bottom-0 left-0 bg-black/70 text-white text-[10px] px-1.5 py-0.5">
                              {index === 0 ? 'COVER' : `#${index + 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => markImageForDeletion(img._id)}
                              className="absolute top-1 right-1 p-1 bg-black/70 border border-red-600 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                              aria-label={`Remove image ${index + 1}`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Newly picked files, not yet uploaded */}
                  {galleryFiles.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">
                        New — uploaded when you save
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {galleryFiles.map((file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="relative h-24 border border-green-700 overflow-hidden"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`New artwork ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-0 left-0 bg-green-700 text-white text-[10px] px-1.5 py-0.5">
                              NEW
                            </span>
                            <button
                              type="button"
                              onClick={() => removeGalleryFile(index)}
                              className="absolute top-1 right-1 p-1 bg-black/70 border border-red-600 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                              aria-label={`Remove new image ${index + 1}`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {imagesToDelete.length > 0 && (
                    <p className="text-yellow-500 text-sm mt-3 flex items-center gap-2">
                      <Trash2 size={14} />
                      {imagesToDelete.length} image(s) will be deleted when you save.
                      <button
                        type="button"
                        onClick={() => setImagesToDelete([])}
                        className="underline hover:text-yellow-300"
                      >
                        Undo
                      </button>
                    </p>
                  )}
                </div>
              ) : (
              /* Primary image */
              <div>
                <label className="admin-label block" htmlFor="content-image">
                  {imageLabel}
                  {!isEditing && <span className="text-red-500"> *</span>}
                </label>
                <input
                  type="file"
                  id="content-image"
                  accept="image/*"
                  onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="content-image"
                  className="upload-zone cursor-pointer p-6 rounded text-center flex flex-col items-center gap-3 block border border-gray-800 hover:border-gray-600 transition-colors"
                >
                  <ImageIcon className="w-10 h-10 text-gray-500" aria-hidden="true" />
                  <div>
                    <p className="text-white font-bold">
                      {isEditing ? 'Click to replace image' : 'Click to upload image'}
                    </p>
                    <p className="text-gray-500 text-sm">JPG, PNG, WEBP or GIF · max 10MB</p>
                  </div>
                </label>

                {(imageFile || editing.image?.url) && (
                  <div className="mt-4 flex items-center gap-4">
                    <img
                      src={imageFile ? URL.createObjectURL(imageFile) : editing.image.url}
                      alt="Selected artwork preview"
                      className="w-28 h-28 object-cover border border-gray-800"
                    />
                    <div className="text-sm text-gray-400">
                      {imageFile ? (
                        <>
                          <p className="text-green-400 font-bold">New file selected</p>
                          <p className="break-all">{imageFile.name}</p>
                          <button
                            type="button"
                            onClick={() => setImageFile(null)}
                            className="mt-2 text-red-400 hover:text-red-300 underline"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <p>Current image</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              )}

              {/* Alt text */}
              <div>
                <label className="admin-label block" htmlFor="field-imageAlt">
                  Image alt text
                </label>
                <input
                  id="field-imageAlt"
                  name="imageAlt"
                  value={form.imageAlt ?? ''}
                  onChange={handleChange}
                  placeholder="Describe the artwork for screen readers"
                  className="admin-input"
                />
                {gallery && (
                  <p className="text-xs text-gray-600 mt-1">
                    Applied to every image in this entry.
                  </p>
                )}
              </div>

              {/* Optional second image (hero mobile crop) */}
              {secondaryImage && (
                <div>
                  <label className="admin-label block" htmlFor="content-secondary-image">
                    {secondaryImage.label}
                  </label>
                  <input
                    type="file"
                    id="content-secondary-image"
                    accept="image/*"
                    onChange={(event) => setSecondaryFile(event.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label
                    htmlFor="content-secondary-image"
                    className="upload-zone cursor-pointer p-4 rounded text-center flex items-center justify-center gap-3 block border border-gray-800 hover:border-gray-600 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-500" aria-hidden="true" />
                    <span className="text-gray-300 text-sm">
                      {secondaryFile ? secondaryFile.name : 'Optional — click to upload'}
                    </span>
                  </label>
                  {secondaryImage.help && (
                    <p className="text-xs text-gray-600 mt-1">{secondaryImage.help}</p>
                  )}
                  {!secondaryFile && editing[secondaryImage.name]?.url && (
                    <img
                      src={editing[secondaryImage.name].url}
                      alt="Current mobile artwork"
                      className="mt-3 w-28 h-28 object-cover border border-gray-800"
                    />
                  )}
                </div>
              )}

              {/* Status */}
              <div>
                <label className="admin-label block" htmlFor="field-status">
                  Status
                </label>
                <select
                  id="field-status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="admin-input"
                >
                  <option value="draft">Draft (hidden)</option>
                  <option value="published">Published (live)</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit" disabled={saving} className="admin-button-primary flex-1">
                  {saving ? 'SAVING…' : isEditing ? 'SAVE CHANGES' : 'CREATE'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="admin-button-outline flex-1"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCollectionManager;
