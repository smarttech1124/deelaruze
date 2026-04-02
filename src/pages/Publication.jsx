import { useEffect, useState, useCallback } from 'react';
import { useCart } from '../hooks/useCart';
import { useParams } from 'react-router-dom';
import { publicationService } from '../services/publicationService';

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Overlay Modal ────────────────────────────────────────────────────────────
const ImageOverlay = ({ images, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() =>
    setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);

  const next = useCallback(() =>
    setCurrent(i => (i + 1) % images.length), [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next, onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
        aria-label="Close overlay"
      >
        <CloseIcon />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <span className="absolute top-5 left-1/2 -translate-x-1/2 text-sm text-white/50 tracking-widest font-mono">
          {current + 1} / {images.length}
        </span>
      )}

      {/* Image container — stop propagation so clicking the image doesn't close */}
      <div
        className="relative flex items-center justify-center w-full h-full px-16"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={images[current].url}
          alt=""
          className="max-h-[90vh] max-w-[90vw] object-contain select-none"
          draggable={false}
        />

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Previous image"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={next}
              className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Next image"
            >
              <ChevronRight />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 overflow-x-auto max-w-[90vw]">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setCurrent(i); }}
              className={`flex-shrink-0 w-12 h-16 rounded overflow-hidden border-2 transition
                ${i === current ? 'border-white' : 'border-white/20 hover:border-white/50'}`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const PublicationSkeleton = () => (
  <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 animate-pulse">
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-6">
        <div className="w-full aspect-[16/9] bg-gray-800 rounded-lg" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-14 h-20 bg-gray-800 rounded-md" />
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

// ─── Main Component ───────────────────────────────────────────────────────────
const Publication = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [adding, setAdding] = useState(false);
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [overlayIndex, setOverlayIndex] = useState(null); // null = closed
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        setLoading(true);
        const response = await publicationService.getById(id);
        const data = response.data || response;
        setPublication(data);
        setActiveIndex(0);
      } catch (err) {
        console.error('Failed to fetch publication:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPublication();
  }, [id]);

  const images = publication?.images || [];

  const goPrev = useCallback(() =>
    setActiveIndex(i => (i - 1 + images.length) % images.length), [images.length]);

  const goNext = useCallback(() =>
    setActiveIndex(i => (i + 1) % images.length), [images.length]);

  const handleAddToCart = async () => {
    if (!publication) return;
    try {
      setAdding(true);
      await addToCart(publication);
    } finally {
      setTimeout(() => setAdding(false), 600);
    }
  };

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

  const activeImage = images[activeIndex]?.url || null;

  return (
    <>
      {/* Overlay */}
      {overlayIndex !== null && (
        <ImageOverlay
          images={images}
          startIndex={overlayIndex}
          onClose={() => setOverlayIndex(null)}
        />
      )}

      <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 lg:pt-20">

          {/* LEFT */}
          <div className="space-y-4">

            {/* Main image with prev/next navigation */}
            <div className="relative w-full aspect-[16/9] bg-gray-900 rounded-lg overflow-hidden border border-gray-800 group">
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

              {/* Slide arrows — only when multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition"
                    aria-label="Previous image"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition"
                    aria-label="Next image"
                  >
                    <ChevronRight />
                  </button>

                  {/* Dot indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all
                          ${i === activeIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/70'}`}
                        aria-label={`Go to image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail strip — single row, horizontally scrollable */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setOverlayIndex(index)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex-shrink-0 w-14 h-20 rounded-md overflow-hidden border-2 transition
                      ${activeIndex === index
                        ? 'border-white'
                        : 'border-gray-800 hover:border-gray-500'}`}
                    aria-label={`View image ${index + 1} in fullscreen`}
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
                £{publication.price}
              </p>

              <div
                className="prose prose-invert text-justify max-w-none mt-8 text-gray-300"
                dangerouslySetInnerHTML={{
                  __html: publication.contributors || '', 
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
    </>
  );
};

export default Publication;