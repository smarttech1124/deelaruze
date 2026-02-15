import { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useParams } from 'react-router-dom';
import { publicationService } from '../services/publicationService';

const PublicationSkeleton = () => (
  <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 animate-pulse">
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-6">
        <div className="w-full aspect-[3/4] bg-gray-800 rounded-lg" />
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-gray-800 rounded-md" />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="h-10 bg-gray-800 rounded w-3/4" />
        <div className="h-4 bg-gray-800 rounded w-1/2" />
        <div className="h-6 bg-gray-800 rounded w-1/4 mt-6" />
        <div className="space-y-3 mt-8">
          <div className="h-4 bg-gray-800 rounded w-full" />
          <div className="h-4 bg-gray-800 rounded w-full" />
          <div className="h-4 bg-gray-800 rounded w-5/6" />
        </div>
        <div className="h-14 bg-gray-700 rounded mt-10" />
      </div>
    </div>
  </div>
);

const Publication = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [adding, setAdding] = useState(false);
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        setLoading(true);

        const response = await publicationService.getById(id);

        // 🔥 Adjust depending on your service shape
        const data = response.data || response;

        setPublication(data);
        setActiveImage(data?.images?.[0]?.url || null);
      } catch (err) {
        console.error('Failed to fetch publication:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPublication();
  }, [id]);

  const handleAddToCart = async () => {
    if (!publication) return;

    try {
      setAdding(true);
      await addToCart(publication);
    } finally {
      setTimeout(() => setAdding(false), 600);
    }
  };

  // ✅ Show skeleton FIRST
  if (loading) return <PublicationSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-lg text-red-500">Failed to load publication</p>
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-lg">Publication not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 lg:pt-20">

        {/* LEFT */}
        <div className="space-y-6">
          <div className="w-full aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            {activeImage ? (
              <img
                src={activeImage}
                alt={publication.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600">
                No Image
              </div>
            )}
          </div>

          {publication.images?.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {publication.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img.url)}
                  className={`aspect-[3/4] rounded-md overflow-hidden border transition
                    ${activeImage === img.url
                      ? 'border-white'
                      : 'border-gray-800 hover:border-gray-500'}
                  `}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col justify-between space-y-10">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">
              {publication.title}
            </h1>

            {publication.tagline && (
              <p className="text-gray-400 mt-3">
                {publication.tagline}
              </p>
            )}

            <p className="text-2xl font-bold mt-6">
              ${publication.price}
            </p>

            <p className={`text-sm mt-2 ${publication.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {publication.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </p>

            <div
              className="prose prose-invert max-w-none mt-8 text-gray-300"
              dangerouslySetInnerHTML={{
                __html: publication.description || '',
              }}
            />
          </div>

          <button
            onClick={handleAddToCart}
            disabled={publication.stock === 0 || adding}
            className={`w-full py-4 text-lg font-bold transition
              ${publication.stock === 0
                ? 'bg-gray-800 cursor-not-allowed'
                : adding
                ? 'bg-gray-300 text-black'
                : 'bg-white text-black hover:opacity-80'}
            `}
          >
            {publication.stock === 0
              ? 'OUT OF STOCK'
              : adding
              ? 'ADDING...'
              : 'ADD TO CHECKOUT'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Publication;
