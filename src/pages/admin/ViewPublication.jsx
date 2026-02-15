import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import Loader from '../../components/common/Loader';

const ViewPublication = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const { data } = await api.get(`/publications/slug/${slug}`);
        setPublication(data?.data || null);
      } catch (error) {
        console.error('Error fetching publication:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublication();
  }, [slug]);

  // ===============================
  // Loading
  // ===============================
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // ===============================
  // Not Found
  // ===============================
  if (!publication) {
    return (
      <div className="min-h-screen bg-black text-white p-6 sm:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xl sm:text-2xl text-gray-400">
            Publication not found
          </p>
          <button
            onClick={() => navigate('/admin/publications')}
            className="admin-button-outline mt-6"
          >
            Back to Publications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black break-words">
            {publication.title?.toUpperCase()}
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Publication details and information
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 admin-panel space-y-8">

            {/* Description */}
            <div>
              <label className="admin-label">Description</label>
              <div
                className="
                  prose prose-sm sm:prose lg:prose-lg
                  max-w-none
                  text-gray-300
                  break-words
                "
                dangerouslySetInnerHTML={{
                  __html: publication.description ?? '',
                }}
              />
            </div>

            {/* Contributors */}
            <div>
              <label className="admin-label">Contributors</label>
              <div
                className="
                  prose prose-sm sm:prose
                  max-w-none
                  text-gray-300
                  break-words
                "
                dangerouslySetInnerHTML={{
                  __html: publication.contributors ?? '',
                }}
              />
            </div>

            {/* Images */}
            {publication.images?.length > 0 && (
              <div>
                <label className="admin-label">Images</label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {publication.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={`${publication.title} ${idx + 1}`}
                      className="
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
              </div>
            )}
          </div>

          {/* META SIDEBAR */}
          <div className="admin-panel space-y-6 h-fit">

            <div>
              <label className="admin-label">Slug</label>
              <p className="text-gray-300 mt-1 break-words">
                {publication.slug}
              </p>
            </div>

            <div>
              <label className="admin-label">Volume</label>
              <p className="text-gray-300 mt-1">
                {publication.volume || '—'}
              </p>
            </div>

            <div>
              <label className="admin-label">Created At</label>
              <p className="text-gray-300 mt-1">
                {formatDate(publication.createdAt)}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="admin-label">Featured</span>
              <span className="text-gray-300">
                {publication.featured ? 'Yes' : 'No'}
              </span>
            </div>

            <div>
              <label className="admin-label">Status</label>
              <p className="text-gray-300 mt-1 capitalize">
                {publication.status}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                className="admin-button-outline w-full"
                onClick={() => navigate('/admin/publications')}
              >
                Back
              </button>

              <button
                className="admin-button-primary w-full"
                onClick={() =>
                  navigate(`/admin/publications/edit/${publication._id}`)
                }
              >
                EDIT
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewPublication;
