import React, { useState, useEffect, Suspense, lazy } from 'react';
import api from '../../services/api';

const Editor = lazy(() =>
  import('@tinymce/tinymce-react').then(m => ({ default: m.Editor }))
);

const AboutDeelaruze = () => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ===============================
  // Fetch existing About content
  // ===============================
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const { data } = await api.get('/about'); // Adjust if needed
        if (data?.data?.description) {
          setDescription(data.data.description);
        }
      } catch (error) {
        console.error('Failed to load About content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  // ===============================
  // Submit
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);

      await api.put('/about', { description });

      alert('About page updated successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to update About page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">

        <header>
          <h1 className="text-5xl font-black">ABOUT</h1>
          <p className="text-gray-500 mt-2">
            Update About page
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">

          <div>
            <label className="admin-label">Page Description</label>

            <Suspense fallback={<div>Loading editor...</div>}>
              <Editor
                apiKey={import.meta.env.VITE_TINYMCE_KEY}
                value={description}
                onEditorChange={(value) => setDescription(value)}
                init={{
                  height: 400,
                  menubar: false,
                  skin: "oxide-dark",
                  content_css: "dark",
                  plugins: "lists link image code",
                  toolbar:
                    "undo redo | bold italic underline | bullist numlist | link | code",
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

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`
                admin-button-primary
                ${saving ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {saving ? 'SAVING…' : 'SAVE CHANGES'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default AboutDeelaruze;
