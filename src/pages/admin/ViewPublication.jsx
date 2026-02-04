import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import {formatDate} from  '../../utils/helpers';

const ViewPublication = () => {
    const navigate = useNavigate();
    const { slug } = useParams();
    const [publication, setPublication] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch publication data
        const fetchPublication = async () => {
            try {
                // Replace with your actual API endpoint
                const response = await api.get(`/publications/slug/${slug}`);
                const data = await response.data.data;
                setPublication(data);
                
            } catch (error) {
                console.error('Error fetching publication:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPublication();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    if (!publication) {
        return (
            <div className="min-h-screen bg-black text-white p-8">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xl">Publication not found</p>
                    <button 
                        onClick={() => navigate('/admin/publications')} 
                        className="admin-button-outline mt-4"
                    >
                        Back to Publications
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto">
                
                <header>
                    <h1 className="text-5xl font-black">
                        {publication.title.toUpperCase()}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Publication details and information
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    
                    {/* MAIN CONTENT */}
                    <div className="lg:col-span-2 admin-panel space-y-6">
                        <div>
                            <label className="admin-label">Description</label>
                            <p className="text-gray-300 mt-2">{publication.description}</p>
                        </div>

                        <div>
                            <label className="admin-label">Contributors</label>
                            <div>
                            <small className="text-gray-300 mt-2">{publication.contributors}</small>
                            </div>
                        </div>

                        {publication.images && publication.images.length > 0 && (
                            <div>
                                <label className="admin-label">Images</label>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    {publication.images.map((img, idx) => (
                                        <img 
                                            key={idx} 
                                            src={img.url} 
                                            alt={`${publication.title} ${idx + 1}`}
                                            className="w-full h-auto rounded border border-gray-700"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* META */}
                    <div className="admin-panel space-y-6">
                        <div>
                            <label className="admin-label">Slug</label>
                            <p className="text-gray-300 mt-2">{publication.slug}</p>
                        </div>

                        <div>
                            <label className="admin-label">Volume</label>
                            <p className="text-gray-300 mt-2">{publication.volume}</p>
                        </div>

                        <div>
                            <label className="admin-label">Created At</label>
                            <p className="text-gray-300 mt-2">{formatDate(publication?.createdAt)}</p>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="admin-label">Featured</span>
                            <span className="text-gray-300">
                                {publication.featured ? 'Yes' : 'No'}
                            </span>
                        </div>

                        <div>
                            <label className="admin-label">Status</label>
                            <p className="text-gray-300 mt-2 capitalize">{publication.status}</p>
                        </div>

                        <div className="flex items-center justify-around pt-4">
                            <button 
                                type="button" 
                                className="admin-button-outline" 
                                onClick={() => navigate('/admin/publications')}
                            >
                                Back
                            </button>
                            <button 
                                className="admin-button-primary"
                                onClick={() => navigate(`/admin/publications/edit/${publication._id}`)}
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