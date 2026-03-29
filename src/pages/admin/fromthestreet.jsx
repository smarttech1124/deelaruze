import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, MapPin, User } from 'lucide-react';
import { fromTheStreet } from '../../services/fromTheStreet';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { formatDate } from '../../utils/helpers';

const FromTheStreet = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await fromTheStreet.getAll();
      setPosts(data.data || []);
    } catch (error) {
      console.error('Error loading from-the-street posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    if (filter === 'all') return posts;
    return posts.filter(p => p.status === filter);
  }, [posts, filter]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setDeletingId(id);
    try {
      await publicationService.delete(id);
      setPosts(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setDeletingId(null);
    }
  }, []);

  const StatusBadge = ({ status }) => {
    const styles = {
      draft:      'bg-yellow-600',
      published:  'bg-green-600',
    };
    return (
      <span className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded ${styles[status] ?? 'bg-gray-600'}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black mb-1">FROM THE STREET</h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Manage artist street posts
            </p>
          </div>

          <Button
            onClick={() => navigate('/admin/fromthestreet/new')}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus size={18} />
            NEW POST
          </Button>
        </div>

        {/* ── Filters ────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-8">
          {['all', 'draft', 'published'].map(f => (
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

        {/* ── Content ────────────────────────────────────────────── */}
        {loading ? (
          <Loader size="lg" />
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <p className="text-xl sm:text-2xl text-gray-400 mb-4">
              No from the street posts found
            </p>
            <Button onClick={() => navigate('/admin/fromthestreet/new')}>
              Create Your First Post
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPosts.map(post => (
              <div
                key={post._id}
                className="bg-gray-900 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 hover:bg-gray-800 transition-colors"
              >
                {/* Thumbnail — first image or placeholder */}
                <div className="relative w-full sm:w-28 h-48 sm:h-28 bg-gray-800 flex-shrink-0 overflow-hidden">
                  {post.images?.[0]?.url ? (
                    <>
                      <img
                        src={post.images[0].url}
                        alt={`${post.artist} – post`}
                        className="w-full h-full object-cover"
                      />
                      {/* multi-image badge */}
                      {post.images.length > 1 && (
                        <span className="absolute top-1.5 right-1.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          +{post.images.length - 1}
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
                  {/* Artist + status row */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <User size={15} className="text-gray-500 flex-shrink-0" />
                      <h3 className="text-lg sm:text-xl font-black truncate">
                        {post.artist}
                      </h3>
                    </div>
                    <StatusBadge status={post.status} />
                  </div>

                  {/* Location */}
                  {post.location && (
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs sm:text-sm mb-2">
                      <MapPin size={13} className="flex-shrink-0" />
                      <span>{post.location}</span>
                    </div>
                  )}

                  {/* Description */}
                  {post.description && (
                    <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 break-words mb-3">
                      {post.description}
                    </p>
                  )}

                  {/* Created date */}
                  <p className="text-xs text-gray-600">
                    {formatDate(post.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 sm:gap-3 justify-end flex-shrink-0">
                  <button
                    onClick={() => navigate(`/admin/fromthestreet/${post._id}`)}
                    className="p-2 sm:p-3 border border-gray-700 hover:border-white transition-colors"
                    title="View"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() => navigate(`/admin/fromthestreet/edit/${post._id}`)}
                    className="p-2 sm:p-3 border border-gray-700 hover:border-white transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(post._id)}
                    disabled={deletingId === post._id}
                    className={`p-2 sm:p-3 border border-red-600 transition-all duration-200 flex items-center justify-center ${
                      deletingId === post._id
                        ? 'bg-red-800 cursor-not-allowed opacity-70'
                        : 'hover:bg-red-600'
                    }`}
                    title="Delete"
                  >
                    <Trash2
                      size={18}
                      className={deletingId === post._id ? 'animate-spin' : ''}
                    />
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

export default FromTheStreet;