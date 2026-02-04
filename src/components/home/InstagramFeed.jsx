import { ChevronRight, Instagram, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const InstagramFeed = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Mock Instagram posts - replace with actual data
    const instagramPosts = [
        { id: 1, image: 'https://images.unsplash.com/photo-1473225071450-1f1462d5aa92?w=400&h=400&fit=crop', likes: '2.3K' },
        { id: 2, image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop', likes: '1.8K' },
        { id: 3, image: 'https://images.unsplash.com/photo-1594523960192-62b92c04089d?w=400&h=400&fit=crop', likes: '3.1K' },
        { id: 4, image: 'https://images.unsplash.com/photo-1551225183-94acb7d595b6?w=400&h=400&fit=crop', likes: '2.7K' },
        { id: 5, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop', likes: '1.9K' },
        { id: 6, image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400&h=400&fit=crop', likes: '2.5K' },
        { id: 7, image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop', likes: '3.4K' },
        { id: 8, image: 'https://images.unsplash.com/photo-1583225214464-9296029427aa?w=400&h=400&fit=crop', likes: '2.1K' },
    ];

    return (
        <section className="relative py-32 px-4 md:px-8 bg-black overflow-hidden">

            {/* Background Elements */}
            <div className="absolute inset-0 grid-pattern" />
            <div 
                className="absolute inset-0 opacity-3"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    mixBlendMode: 'overlay',
                    pointerEvents: 'none'
                }}
            />

            {/* Gradient Accents */}
            <div 
                className="absolute top-1/4 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
                style={{
                    background: 'radial-gradient(circle, #fd1d1d 0%, transparent 70%)'
                }}
            />
            <div 
                className="absolute bottom-1/4 left-0 w-96 h-96 rounded-full blur-3xl opacity-20"
                style={{
                    background: 'radial-gradient(circle, #833ab4 0%, transparent 70%)'
                }}
            />

            <div className="instagram-container relative z-10 max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="mb-16">
                    <div className="section-badge mb-6">
                        SECTION 03
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
                        <div className="flex items-center gap-6">
                            <div 
                                className="instagram-icon w-16 h-16 flex items-center justify-center rounded-full"
                                style={{
                                    background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)'
                                }}
                            >
                                <Instagram size={32} className="text-white" />
                            </div>
                            <div>
                                <h2 className="instagram-title text-5xl md:text-7xl text-white tracking-tight mb-2">
                                    FROM THE
                                </h2>
                                <h2 className="instagram-title text-5xl md:text-7xl tracking-tight stat-counter">
                                    STREETS
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                        <div className="h-px w-12 bg-gradient-to-r from-purple-500 to-orange-500" />
                        <p className="tracking-wide">
                            Daily visual stories from urban artists worldwide
                        </p>
                    </div>
                </div>

                {/* Instagram Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {instagramPosts.map((post, index) => (
                        <a
                            key={post.id}
                            href="https://instagram.com/deelaruze"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="instagram-grid-item group"
                            style={{ animationDelay: `${index * 0.08}s` }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Rotating Border Effect */}
                            <div className="rotating-border" />

                            {/* Corner Accents */}
                            <div className="corner-accent corner-tl" />
                            <div className="corner-accent corner-br" />

                            {/* Image */}
                            <img 
                                src={post.image} 
                                alt={`Instagram post ${index + 1}`}
                                className="instagram-image"
                            />

                            {/* Like Badge */}
                            <div className="like-badge absolute top-4 right-4 px-3 py-1 bg-black/80 backdrop-blur-sm rounded-full flex items-center gap-2 text-white text-xs font-bold">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                {post.likes}
                            </div>

                            {/* Hover Overlay */}
                            <div className="instagram-overlay">
                                <Instagram size={40} className="text-white animate-pulse" />
                                <span className="text-white text-sm font-bold tracking-wider">
                                    VIEW ON INSTAGRAM
                                </span>
                                <ExternalLink size={20} className="text-white" />
                            </div>
                        </a>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="text-center">
                    {/* Stats */}
                    <div className="flex justify-center gap-12 mb-8 flex-wrap">
                        <div className="text-center">
                            <div className="stat-counter text-4xl md:text-5xl font-black mb-2">
                                12.5K
                            </div>
                            <div className="text-gray-500 text-sm tracking-widest">
                                FOLLOWERS
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="stat-counter text-4xl md:text-5xl font-black mb-2">
                                2.8K
                            </div>
                            <div className="text-gray-500 text-sm tracking-widest">
                                POSTS
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="stat-counter text-4xl md:text-5xl font-black mb-2">
                                156
                            </div>
                            <div className="text-gray-500 text-sm tracking-widest">
                                ARTISTS
                            </div>
                        </div>
                    </div>

                    {/* Follow Button */}
                    <a
                        href="https://instagram.com/deelaruze"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="follow-button inline-flex items-center gap-3 px-10 py-5 text-white font-bold text-lg tracking-wider group"
                    >
                        <Instagram size={24} />
                        FOLLOW @DEELARUZE
                        <ChevronRight 
                            size={24} 
                            className="transition-transform group-hover:translate-x-1" 
                        />
                    </a>

                    {/* Bottom Text */}
                    <div className="mt-8 text-gray-600 text-xs tracking-widest">
                        JOIN THE MOVEMENT · DAILY DROPS · RAW CONTENT
                    </div>
                </div>

                {/* Bottom Divider */}
                <div className="mt-16 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            </div>
        </section>
    );
};

export default InstagramFeed;