import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, CalendarRange } from 'lucide-react';
import { publicationService } from '../../services/publicationService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import {truncate, formatDate} from  '../../utils/helpers';

const Publications = () => {
  const navigate = useNavigate();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadPublications();
  }, [filter]);

  const loadPublications = async () => {
    setLoading(true);
    try {
      // const params = filter !== 'all' ? { status: filter } : {};
      const data = await publicationService.getAll();
      console.log(data)
      setPublications(data.data);
    } catch (error) {
      console.error('Error loading publications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this publication?')) {
      return;
    }

    try {
      await publicationService.delete(id);
      setPublications(publications.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error deleting publication:', error);
      alert('Failed to delete publication');
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      available: 'bg-green-600',
      'sold out': 'bg-red-600',
      'coming soon': 'bg-yellow-600',
    };

    return (
      <span className={`px-3 py-1 text-xs font-bold ${colors[status]} rounded`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2">PUBLICATIONS</h1>
            <p className="text-gray-400">Manage your publications and inventory</p>
          </div>
          <Button
            onClick={() => navigate('/admin/publications/new')}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            NEW PUBLICATION
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          {['all', 'draft', 'published'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 font-bold transition-colors ${
                filter === f
                  ? 'bg-white text-black'
                  : 'border-2 border-gray-700 hover:border-white'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Publications List */}
        {loading ? (
          <Loader size="lg" />
        ) : publications.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400 mb-4">No publications found</p>
            <Button onClick={() => navigate('/admin/publications/new')}> 
              Create Your First Publication
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {publications.map((pub) => (
              <div
                key={pub._id}
                className="bg-gray-900 p-6 flex items-center gap-6 hover:bg-gray-800 transition-colors"
              >
                {/* Image */}
                <div className="w-24 h-32 bg-gray-800 flex-shrink-0">
                  {pub.images?.[0]?.url ? (
                    <img
                      src={pub.images[0].url}
                      alt={pub.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      No Image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-black">{pub.title}</h3>
                      {pub.slug && (
                        <p className="text-gray-400">{pub.slug}</p>
                      )}
                    </div>
                    <StatusBadge status={pub.status} />
                  </div>
                  <p className="text-gray-500 text-sm mb-2">
                    {truncate(pub.contributors?.[0], 90)}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className='flex items-center'><CalendarRange size={15} /> &nbsp; {formatDate(pub.createdAt)}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/publications/${pub.slug}`)}
                    className="p-3 border border-gray-700 hover:border-white transition-colors"
                    title="View"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => navigate(`/admin/publications/edit/${pub._id}`)}
                    className="p-3 border border-gray-700 hover:border-white transition-colors"
                    title="Edit"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(pub._id)}
                    className="p-3 border border-red-600 hover:bg-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={20} />
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