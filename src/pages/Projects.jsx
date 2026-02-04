import React, { useEffect, useState } from 'react';
import { publicationService } from '../services/publicationService';
import ProductGrid from '../components/shop/ProductGrid';
import Loader from '../components/common/Loader';
import { Grid3x3, LayoutGrid, Filter, Search } from 'lucide-react';

const Projects = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'compact'

  useEffect(() => {
    const fetchPublications = async () => {
      setLoading(true);
      try {
        const data = await publicationService.getAll();
        setPublications(data.data);
      } catch (error) {
        console.error('Error loading publications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, [filter]);

  const categories = [
    { value: 'all', label: 'ALL WORK', count: publications.length, color: '#FF3366' },
    { value: 'zine', label: 'ZINES', count: 0, color: '#FFB800' },
    { value: 'sticker pack', label: 'STICKERS', count: 0, color: '#00FF94' },
    { value: 'volume', label: 'VOLUMES', count: 0, color: '#00D9FF' },
    { value: 'special edition', label: 'SPECIAL', count: 0, color: '#9D4EDD' },
  ];

  const filteredPublications = publications.filter(pub =>
    pub.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pub.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">

      {/* Background Elements */}
      <div className="fixed inset-0 grid-bg" />
      <div 
        className="fixed inset-0 opacity-3"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
          pointerEvents: 'none'
        }}
      />

      {/* Gradient Accents */}
      <div 
        className="fixed top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
        style={{ background: 'radial-gradient(circle, #FF3366 0%, transparent 70%)' }}
      />
      <div 
        className="fixed bottom-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
        style={{ background: 'radial-gradient(circle, #00FF94 0%, transparent 70%)' }}
      />

      <div className="projects-container relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="section-badge hero-fade">
              CATALOG
            </div>

            <div className="hero-fade mb-6" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-6 mb-4">
                <div className="h-1 w-16 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                <h1 className="projects-title text-6xl md:text-8xl text-white tracking-tight">
                  PUBLICATIONS
                </h1>
              </div>
              <div className="h-px bg-gradient-to-r from-red-500/50 via-transparent to-transparent" />
            </div>

            <p 
              className="hero-fade text-lg md:text-xl text-gray-400 max-w-3xl leading-relaxed"
              style={{ animationDelay: '0.2s' }}
            >
              A curated collection of street art, graffiti, and sticker culture from
              around the world. Each publication celebrates the raw energy of
              independent artists.
            </p>
          </div>

          {/* Search and View Controls */}
          <div 
            className="filter-reveal flex flex-col md:flex-row gap-4 mb-8"
            style={{ animationDelay: '0.3s' }}
          >
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search by title or artist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input w-full pl-12 pr-4 py-4 text-white"
              />
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                aria-label="Grid view"
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`view-toggle ${viewMode === 'compact' ? 'active' : ''}`}
                aria-label="Compact view"
              >
                <LayoutGrid size={20} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Filter size={20} className="text-gray-500" />
              <span className="text-sm text-gray-500 tracking-widest">FILTER BY CATEGORY</span>
            </div>

            <div className="flex flex-wrap gap-3">
              {categories.map((cat, index) => (
                <button
                  key={cat.value}
                  onClick={() => setFilter(cat.value)}
                  className={`filter-tab filter-reveal ${
                    filter === cat.value ? 'active' : ''
                  }`}
                  style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                >
                  <span className="relative z-10 flex items-center font-bold tracking-wider">
                    {cat.label}
                    <span className="count-badge">
                      {cat.value === 'all' ? publications.length : cat.count}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Results Counter */}
          <div 
            className="filter-reveal flex items-center justify-between mb-8 pb-6 border-b border-white/10"
            style={{ animationDelay: '0.7s' }}
          >
            <div className="flex items-center gap-4">
              <span className="results-counter text-4xl md:text-5xl">
                {filteredPublications.length}
              </span>
              <div className="text-gray-500">
                <div className="text-sm tracking-widest">RESULTS</div>
                <div className="text-xs">
                  {filter === 'all' ? 'All Categories' : categories.find(c => c.value === filter)?.label}
                </div>
              </div>
            </div>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Clear search ✕
              </button>
            )}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader size="lg" />
            </div>
          ) : filteredPublications.length > 0 ? (
            <div className="filter-reveal" style={{ animationDelay: '0.8s' }}>
              <ProductGrid products={filteredPublications} viewMode={viewMode} />
            </div>
          ) : (
            <div 
              className="filter-reveal py-20 text-center"
              style={{ animationDelay: '0.8s' }}
            >
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Search size={40} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  No results found
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery 
                    ? `No publications match "${searchQuery}"`
                    : `No publications in this category yet`
                  }
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilter('all');
                  }}
                  className="px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors"
                >
                  VIEW ALL PUBLICATIONS
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;