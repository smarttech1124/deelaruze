import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const NewPublication = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // detect edit mode
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    price: '',
    stock: '',
    description: '',
    contributors: '',
    featured: false,
    status: 'draft',
    images: []
  });

  // ===============================
  // Fetch publication if editing
  // ===============================
  useEffect(() => {
    if (!isEdit) return;

    const fetchPublication = async () => {
      try {
        const res = await api.get(`/publications/${id}`);
        const pub = res.data.data;

        setForm({
          title: pub.title || '',
          slug: pub.slug || '',
          price: pub.price || '',
          stock: pub.stock || '',
          description: pub.description || '',
          contributors: pub.contributors || '',
          featured: pub.featured || false,
          status: pub.status || 'draft',
          images: [] // do not preload files
        });
      } catch (err) {
        alert('Failed to load publication');
        navigate('/admin/publications');
      }
    };

    fetchPublication();
  }, [id, isEdit, navigate]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImages = e => {
    setForm(prev => ({
      ...prev,
      images: [...e.target.files]
    }));
  };

  const submit = async e => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();

    Object.entries(form).forEach(([k, v]) => {
      if (k === 'images') {
        v.forEach(img => data.append('images', img));
      } else {
        data.append(k, v);
      }
    });

    try {
      if (isEdit) {
        await api.put(`/publications/${id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await api.post('/publications', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      navigate('/admin/publications');
    } catch (error) {
      alert(isEdit ? 'Failed to update' : 'Failed to publish');
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

          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 admin-panel space-y-6">
            <div>
              <label className="admin-label">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="6"
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Contributors</label>
              <input
                name="contributors"
                value={form.contributors}
                onChange={handleChange}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">
                {isEdit ? 'Add More Images' : 'Images'}
              </label>
              <input type="file" multiple onChange={handleImages} />
            </div>
          </div>

          {/* META */}
          <div className="admin-panel space-y-6">
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
                type="text"
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
            
            <div className='flex items-center justify-around'>
              <button type='button' className="admin-button-outline" onClick={() => navigate('/admin/publications')}>
                Back
              </button>
              <button className="admin-button-primary">
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
