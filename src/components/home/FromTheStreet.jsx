import { ChevronRight, ChevronLeft, Instagram, ExternalLink, X, MapPin, Heart } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { fromTheStreet } from '../../services/fromTheStreet';

// ---------------------------------------------------------------------------
// PostModal
// ---------------------------------------------------------------------------
const PostModal = ({ post, onClose }) => {
    const [slideIndex, setSlideIndex] = useState(0);

    // images is [{ url, publicId, _id }]
    const images = post?.images ?? [];
    const total  = images.length;

    const prev = useCallback(() => setSlideIndex(i => (i - 1 + total) % total), [total]);
    const next = useCallback(() => setSlideIndex(i => (i + 1) % total), [total]);

    useEffect(() => {
        const handleKey = e => {
            if (e.key === 'Escape')     onClose();
            if (e.key === 'ArrowLeft')  prev();
            if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose, prev, next]);

    if (!post) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div
                className="relative w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col md:flex-row"
                style={{
                    background: 'linear-gradient(135deg, #111 0%, #0a0a0a 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(131,58,180,0.2)',
                    maxHeight: '90vh',
                }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center text-white transition-all"
                    style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(253,29,29,0.6)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                    <X size={18} />
                </button>

                {/* ---- Image / Slider panel ---- */}
                <div
                    className="relative flex-shrink-0 w-full md:w-1/2 bg-black"
                    style={{ aspectRatio: '1/1', maxHeight: '60vh' }}
                >
                    <div className="relative w-full h-full overflow-hidden">

                        {/* Slides — each image is an object; use .url */}
                        {images.map((img, i) => (
                            <img
                                key={img._id ?? i}
                                src={img.url}
                                alt={`Slide ${i + 1}`}
                                className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
                                style={{
                                    opacity:   i === slideIndex ? 1 : 0,
                                    transform: i === slideIndex ? 'scale(1)' : 'scale(1.04)',
                                }}
                            />
                        ))}

                        {/* Gradient overlay */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 40%)' }}
                        />

                        {/* Arrows */}
                        {total > 1 && (
                            <>
                                <button
                                    onClick={prev}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all"
                                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(131,58,180,0.8)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={next}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all"
                                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(131,58,180,0.8)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}

                        {/* Pagination dots */}
                        {total > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                {images.map((img, i) => (
                                    <button
                                        key={img._id ?? i}
                                        onClick={() => setSlideIndex(i)}
                                        className="rounded-full transition-all duration-300"
                                        style={{
                                            width:      i === slideIndex ? 20 : 6,
                                            height:     6,
                                            background: i === slideIndex
                                                ? 'linear-gradient(90deg, #833ab4, #fd1d1d)'
                                                : 'rgba(255,255,255,0.35)',
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Counter badge */}
                        {total > 1 && (
                            <div
                                className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs font-bold z-10"
                                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
                            >
                                {slideIndex + 1} / {total}
                            </div>
                        )}
                    </div>
                </div>

                {/* ---- Content panel ---- */}
                <div className="flex flex-col flex-1 p-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>

                    {/* Artist header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
                        >
                            <Instagram size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm tracking-wider">
                                {post.artist}
                            </p>
                            {post.location && (
                                <div className="flex items-center gap-1 mt-0.5">
                                    <MapPin size={10} style={{ color: '#fd1d1d' }} />
                                    <span className="text-xs tracking-wide" style={{ color: '#888' }}>
                                        {post.location}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Image count pill */}
                        {total > 1 && (
                            <div
                                className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white"
                                style={{ background: 'rgba(131,58,180,0.2)', border: '1px solid rgba(131,58,180,0.4)' }}
                            >
                                ⊞ {total} photos
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />

                    {/* Description */}
                    {post.description && (
                        <p
                            className="text-sm leading-relaxed flex-1"
                            style={{ color: '#aaa', fontFamily: 'Georgia, serif' }}
                        >
                            {post.description}
                        </p>
                    )}

                    {/* Thumbnail strip — use img.url */}
                    {total > 1 && (
                        <div className="mt-5">
                            <p className="text-xs tracking-widest mb-3" style={{ color: '#555' }}>ALL PHOTOS</p>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {images.map((img, i) => (
                                    <button
                                        key={img._id ?? i}
                                        onClick={() => setSlideIndex(i)}
                                        className="flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200"
                                        style={{
                                            width:   52,
                                            height:  52,
                                            border:  i === slideIndex ? '2px solid #fd1d1d' : '2px solid transparent',
                                            opacity: i === slideIndex ? 1 : 0.45,
                                        }}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Instagram CTA */}
                    {/* <a
                        href={`https://instagram.com/${post.artist}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold tracking-wider transition-all"
                        style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d 50%, #fcb045)' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        <Instagram size={16} />
                        VIEW ON INSTAGRAM
                        <ExternalLink size={14} />
                    </a> */}
                </div>
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------
const SkeletonCard = () => (
    <div
        className="relative rounded-xl overflow-hidden"
        style={{ aspectRatio: '1/1', background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}
    >
        <div
            className="absolute inset-0"
            style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
                animation: 'shimmer 1.6s infinite',
            }}
        />
    </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const FromTheStreetSection = ({ instagramHandle = 'deelaruze' }) => {
    const [posts,        setPosts]        = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);

    // ---- Fetch ----
    useEffect(() => {
        let cancelled = false;

        const fetchPosts = async () => {
            try {
                setLoading(true);
                setError(null);

                // fromTheStreet.getAll() is assumed to return the parsed JSON directly
                // (i.e. the axios/custom-api wrapper, not a raw fetch Response)
                const json = await fromTheStreet.getAll();

                if (cancelled) return;

                // Unwrap { success, count, data: [...] }
                const list = json?.data ?? (Array.isArray(json) ? json : []);

                // Only surface published posts on the public page
                setPosts(list.filter(p => p.status === 'published'));

            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchPosts();
        return () => { cancelled = true; };
    }, []);

    // ---- Inject shimmer keyframe once ----
    useEffect(() => {
        const id = 'ig-shimmer-style';
        if (document.getElementById(id)) return;
        const style = document.createElement('style');
        style.id = id;
        style.textContent = `
            @keyframes shimmer {
                0%   { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            .ig-grid-item { transition: transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.35s ease; }
            .ig-grid-item:hover { transform: scale(1.03); }
            .ig-overlay { opacity: 0; transition: opacity 0.3s ease; }
            .ig-grid-item:hover .ig-overlay { opacity: 1; }
            .ig-img { transition: transform 0.5s ease; }
            .ig-grid-item:hover .ig-img { transform: scale(1.08); }
        `;
        document.head.appendChild(style);
    }, []);

    const displayPosts = loading ? Array(8).fill(null) : posts;

    return (
        <>
            {selectedPost && (
                <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
            )}

            <section className="relative py-32 px-4 md:px-8 bg-black overflow-hidden">

                {/* Background grid */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                    }}
                />

                {/* Gradient accents */}
                <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #fd1d1d 0%, transparent 70%)' }} />
                <div className="absolute bottom-1/4 left-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #833ab4 0%, transparent 70%)' }} />

                <div className="relative z-10 max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="mb-16">
                        <div className="flex items-center gap-6">
                            <div
                                className="w-16 h-16 flex items-center justify-center rounded-full flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)' }}
                            >
                                <Instagram size={32} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight mb-2">
                                    FROM THE
                                </h2>
                                <h2
                                    className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight"
                                    style={{ background: 'linear-gradient(90deg, #833ab4, #fd1d1d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                                >
                                    STREETS
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Error banner */}
                    {error && !loading && (
                        <div
                            className="mb-8 px-6 py-4 rounded-xl text-sm flex items-center gap-3"
                            style={{ background: 'rgba(253,29,29,0.1)', border: '1px solid rgba(253,29,29,0.25)', color: '#fd7070' }}
                        >
                            <span>⚠</span>
                            Could not load posts: {error}
                        </div>
                    )}

                    {/* Empty state (not loading, no error, no posts) */}
                    {!loading && !error && posts.length === 0 && (
                        <p className="text-gray-600 text-sm tracking-widest text-center py-16">
                            NO POSTS YET — CHECK BACK SOON
                        </p>
                    )}

                    {/* Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {displayPosts.map((post, index) =>
                            post === null ? (
                                <SkeletonCard key={index} />
                            ) : (
                                <button
                                    key={post._id ?? index}
                                    className="ig-grid-item relative rounded-xl overflow-hidden text-left cursor-pointer"
                                    style={{
                                        aspectRatio: '1/1',
                                        border: '1px solid rgba(255,255,255,0.07)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                    }}
                                    onClick={() => setSelectedPost(post)}
                                    onKeyDown={e => e.key === 'Enter' && setSelectedPost(post)}
                                >
                                    {/* Corner accents */}
                                    <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-500 z-10 rounded-tl-xl" />
                                    <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500 z-10 rounded-br-xl" />

                                    {/* Thumbnail — images[0].url */}
                                    {post.images?.[0]?.url && (
                                        <img
                                            src={post.images[0].url}
                                            alt={`Post by ${post.artist}`}
                                            className="ig-img absolute inset-0 w-full h-full object-cover"
                                        />
                                    )}

                                    {/* Multi-image badge */}
                                    {post.images?.length > 1 && (
                                        <div
                                            className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-bold"
                                            style={{ background: 'rgba(131,58,180,0.85)', backdropFilter: 'blur(4px)' }}
                                        >
                                            <span>⊞</span> {post.images.length}
                                        </div>
                                    )}

                                    {/* Hover overlay */}
                                    <div
                                        className="ig-overlay absolute inset-0 flex flex-col items-center justify-center gap-2"
                                        style={{ background: 'linear-gradient(135deg, rgba(131,58,180,0.7), rgba(253,29,29,0.7))' }}
                                    >
                                        <Instagram size={36} className="text-white" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }} />
                                        <span className="text-white text-xs font-bold tracking-widest">VIEW POST</span>
                                        {post.location && (
                                            <span className="flex items-center gap-1 text-white/70 text-xs">
                                                <MapPin size={10} />
                                                {post.location}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            )
                        )}
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <a
                            href={`https://instagram.com/${instagramHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-10 py-5 text-white font-bold text-lg tracking-wider group rounded-full transition-all"
                            style={{
                                background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
                                boxShadow: '0 0 40px rgba(253,29,29,0.3)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(253,29,29,0.5)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 0 40px rgba(253,29,29,0.3)'; }}
                        >
                            <Instagram size={24} />
                            FOLLOW @{instagramHandle.toUpperCase()}
                            <ChevronRight size={24} className="transition-transform group-hover:translate-x-1" />
                        </a>

                        <div className="mt-8 text-gray-600 text-xs tracking-widest">
                            JOIN THE MOVEMENT · DAILY DROPS · RAW CONTENT
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default FromTheStreetSection;