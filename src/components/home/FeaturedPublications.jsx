import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import Loader from '../common/Loader';
import { publicationService } from '../../services/publicationService';

const FeaturedPublication = () => {
    const [featuredPublications, setFeaturedPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    useEffect(() => {
        const fetchFeatured = async () => {
          try {
            const data = await publicationService.getFeatured();
            setFeaturedPublications(data.data);
          } catch (error) {
            console.error('Error loading featured publications:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchFeatured();
    }, []);

    return (
        <section className="relative py-32 px-4 md:px-8 bg-black overflow-hidden">

            {/* Background Elements */}
            <div className="absolute inset-0 grid-bg" />
            <div 
                className="noise-texture absolute inset-0"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            {/* Gradient Accents */}
            <div 
                className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
                style={{
                    background: 'radial-gradient(circle, #00FF94 0%, transparent 70%)'
                }}
            />
            <div 
                className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
                style={{
                    background: 'radial-gradient(circle, #FFB800 0%, transparent 70%)'
                }}
            />

            <div className="featured-container relative z-10 max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="mb-16">
                    {/* <div className="section-badge mb-6">
                        SECTION 02
                    </div> */}

                    <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-4">
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                {/* <div className="h-1 w-12 bg-gradient-to-r from-transparent via-green-500 to-transparent" /> */}
                                <h2 className="featured-title text-5xl md:text-7xl text-white tracking-tight">
                                    LATEST RELEASE
                                </h2>
                            </div>
                            <p className="text-gray-400 text-sm md:text-base tracking-wide">
                                Fresh from the streets, hot off the press
                            </p>
                        </div>

                        {/* <Link
                            to="/shop"
                            className="view-all-btn flex items-center gap-2 px-6 py-3 border border-white/20 text-sm font-bold text-white hover:border-red-500/50 transition-all group"
                        >
                            VIEW ALL PROJECTS
                            <ChevronRight 
                                size={16} 
                                className="transition-transform group-hover:translate-x-1" 
                            />
                        </Link> */}
                    </div>
                    <div className="content-reveal mb-20" style={{ animationDelay: '1.4s' }}>
                        <p className="text-lg text-gray-300 leading-relaxed">
                        Every publication I create is a collaboration with the artists who make
                        the streets come alive. I document the ephemeral, celebrate the
                        underground, and give voice to those who refuse to be silenced.
                        </p>
                        <p className="text-lg text-gray-300 leading-relaxed">
                            I've published work from 190 artists across 31 countries so far. From New York to Tokyo, 
                            from Lagos to Sao Paulo, from Zagreb to Bangkok streets speak universal language.

                        </p>
                    </div>

                    {/* <div className="h-px w-full bg-gradient-to-r from-green-500/50 via-transparent to-transparent" /> */}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredPublications.slice(0, 3).map((pub, index) => (
                            <Link
                                key={pub._id}
                                to={`/publication/${pub._id}`}
                                className="product-card card-reveal group"
                                style={{ animationDelay: `${index * 0.15}s` }}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {/* Featured Badge */}
                                <div className="featured-badge">
                                    FEATURED
                                </div>

                                {/* Image */}
                                <div className="product-image">
                                    <img 
                                        src={pub.images[0]?.url || 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=600&h=800&fit=crop'} 
                                        alt={pub.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="image-overlay" />

                                    {/* Quick View Button */}
                                    <div className="quick-view absolute bottom-4 left-4 right-4 flex justify-center">
                                        <div className="px-6 py-3 bg-white text-black font-bold text-sm tracking-wider flex items-center gap-2 hover:bg-red-500 hover:text-white transition-colors">
                                            QUICK VIEW
                                            <ArrowUpRight size={16} />
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-6 space-y-4">
                                    {/* Title */}
                                    <div>
                                        <h3 className="font-bold text-xl text-white mb-2 tracking-tight line-clamp-2">
                                            {pub.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm line-clamp-1">
                                            {pub.tagline || 'Independent Artist'}
                                        </p>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-gradient-to-r from-white/10 via-white/20 to-white/10" />

                                    {/* Price & Stock */}
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1 tracking-wider">PRICE</div>
                                            <div className="price-tag text-2xl font-black">
                                                ${pub.price || '0.00'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {/* <div className="text-xs text-gray-500 mb-1 tracking-wider">STOCK</div>
                                            <div className={`text-sm font-bold ${pub.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {pub.stock > 0 ? `${pub.stock} LEFT` : 'SOLD OUT'}
                                            </div> */}
                                        </div>
                                    </div>

                                    {/* Hover Indicator */}
                                    <div 
                                        className="h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                                        style={{
                                            transform: hoveredIndex === index ? 'scaleX(1)' : 'scaleX(0)',
                                            transformOrigin: 'left'
                                        }}
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Bottom Accent */}
                <div className="mt-16 flex items-center justify-center gap-4 text-gray-600 text-xs tracking-widest">
                    <span>HAND-PICKED</span>
                    <span className="text-green-500">///</span>
                    <span>QUALITY CURATED</span>
                    <span className="text-green-500">///</span>
                    <span>UNDERGROUND CERTIFIED</span>
                </div>
            </div>
        </section>
    );
};

export default FeaturedPublication;