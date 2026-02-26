import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, CalendarRange } from 'lucide-react';
import { publicationService } from '../../services/publicationService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { formatDate } from '../../utils/helpers';

const Publications = () => {
  const navigate = useNavigate();

  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [deletingId, setDeletingId] = useState(null);


  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    setLoading(true);
    try {
      const data = await publicationService.getAll();
      setPublications(data.data || []);
    } catch (error) {
      console.error('Error loading publications:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Proper Filter Logic (Client-Side)
  const filteredPublications = useMemo(() => {
    if (filter === 'all') return publications;
    return publications.filter(pub => pub.status === filter);
  }, [publications, filter]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this publication?')) {
      return;
    }

    try {
      await publicationService.delete(id);
      setPublications(prev => prev.filter(p => p._id !== id));

    } catch (error) {
      console.error('Error deleting publication:', error);
      alert('Failed to delete publication');
    }
  }, []);

  const StatusBadge = ({ status }) => {
    const colors = {
      draft: 'bg-yellow-600',
      published: 'bg-green-600',
    };

    return (
      <span
        className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold ${colors[status] || 'bg-gray-600'} rounded`}
      >
        {status?.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black mb-1">
              PUBLICATIONS
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Manage your publications and inventory
            </p>
          </div>

          <Button
            onClick={() => navigate('/admin/publications/new')}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus size={18} />
            NEW PUBLICATION
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-8">
          {['all', 'draft', 'published'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold transition-colors ${
                filter === f
                  ? 'bg-white text-black'
                  : 'border border-gray-700 hover:border-white'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Publications */}
        {loading ? (
          <Loader size="lg" />
        ) : filteredPublications.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <p className="text-xl sm:text-2xl text-gray-400 mb-4">
              No publications found
            </p>
            <Button onClick={() => navigate('/admin/publications/new')}>
              Create Your First Publication
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPublications.map((pub) => (
              <div
                key={pub._id}
                className="
                  bg-gray-900
                  p-4 sm:p-6
                  flex
                  flex-col sm:flex-row
                  gap-4 sm:gap-6
                  hover:bg-gray-800
                  transition-colors
                "
              >
                {/* Image */}
                <div className="w-full sm:w-24 h-48 sm:h-32 bg-gray-800 flex-shrink-0">
                  {pub.images?.[0]?.url ? (
                    <img
                      src={pub.images[0].url}
                      alt={pub.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                      No Image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black">
                        {pub.title}
                      </h3>
                      {pub.slug && (
                        <p className="text-gray-400 text-sm">
                          {pub.slug}
                        </p>
                      )}
                    </div>
                    <div>
                      <StatusBadge status={pub.status} />
                      {pub.featured && (
                        <span className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold bg-blue-600 rounded ml-2">
                          FEATURED
                        </span>
                      )}
                    </div>
                    
                  </div>

                  <div
                    className="
                      text-gray-400
                      text-xs sm:text-sm
                      mb-2
                      prose prose-sm sm:prose
                      max-w-none
                      line-clamp-2
                      break-words
                    "
                    dangerouslySetInnerHTML={{
                      __html: pub.contributors ?? '',
                    }}
                  />

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                    <CalendarRange size={14} />
                    {formatDate(pub.createdAt)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 sm:gap-3 justify-end">
                  <button
                    onClick={() =>
                      navigate(`/admin/publications/${pub.slug}`)
                    }
                    className="p-2 sm:p-3 border border-gray-700 hover:border-white transition-colors"
                    title="View"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/admin/publications/edit/${pub._id}`)
                    }
                    className="p-2 sm:p-3 border border-gray-700 hover:border-white transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(pub._id)}
                    disabled={deletingId === pub._id}
                    className={`
                      p-2 sm:p-3
                      border border-red-600
                      transition-all duration-200
                      flex items-center justify-center
                      ${deletingId === pub._id
                        ? 'bg-red-800 cursor-not-allowed opacity-70'
                        : 'hover:bg-red-600'}
                    `}
                    title="Delete"
                  >
                    {deletingId === pub._id ? (
                      <span className="animate-spin">
                        <Trash2 size={16} />
                      </span>
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Publications;
