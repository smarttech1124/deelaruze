import React, { useEffect, useState } from 'react';
import { shopService } from '../services/shopService';
import ProductGrid from '../components/shop/ProductGrid';
import Loader from '../components/common/Loader';
import { ShoppingBag, TrendingUp, DollarSign, Calendar, SortAsc, Package, Instagram } from 'lucide-react';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('-createdAt');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await shopService.getAll({ 
          status: 'available',
          sort: sortBy 
        });
        setProducts(data.data);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const sortOptions = [
    { value: '-createdAt', label: 'Newest First', icon: Calendar },
    { value: 'createdAt', label: 'Oldest First', icon: Calendar },
    { value: 'price', label: 'Price: Low to High', icon: DollarSign },
    { value: '-price', label: 'Price: High to Low', icon: DollarSign },
    { value: 'title', label: 'Title: A-Z', icon: SortAsc },
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-20', label: '$0 - $20' },
    { value: '20-50', label: '$20 - $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100+', label: '$100+' },
  ];

  const filteredProducts = products.filter(product => {
    if (priceRange === 'all') return true;
    const price = product.price || 0;
    
    if (priceRange === '0-20') return price <= 20;
    if (priceRange === '20-50') return price > 20 && price <= 50;
    if (priceRange === '50-100') return price > 50 && price <= 100;
    if (priceRange === '100+') return price > 100;
    
    return true;
  });

  const stats = [
    { value: filteredProducts.length, label: 'Items', icon: Package },
    { value: products.filter(p => p.stock > 0).length, label: 'In Stock', icon: TrendingUp },
    { value: `$${products.length > 0 ? Math.min(...products.map(p => p.price || 0)) : 0}`, label: 'Starting At', icon: DollarSign },
  ];

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
        className="fixed top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
        style={{ background: 'radial-gradient(circle, #FF3366 0%, transparent 70%)' }}
      />
      <div 
        className="fixed bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
        style={{ background: 'radial-gradient(circle, #00FF94 0%, transparent 70%)' }}
      />

      <div className="shop-container relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-16">
            {/* <div className="section-badge hero-fade">
              STORE
            </div> */}

            <div className="hero-fade mb-6" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-6 mb-4">
                <ShoppingBag className="icon-float w-12 h-12 md:w-16 md:h-16 text-red-500" />
                <h1 className="shop-title text-6xl md:text-8xl text-white tracking-tight">
                  SHOP
                </h1>
              </div>
              <div className="h-px bg-gradient-to-r from-red-500/50 via-transparent to-transparent" />
            </div>

            <p 
              className="hero-fade text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed"
              style={{ animationDelay: '0.2s' }}
            >
              Limited editions. Independent publishing. Support the underground.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="stat-card p-6 text-center filter-reveal"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <stat.icon className="w-6 h-6 mx-auto mb-3 text-gray-500" />
                <div className="stat-value text-3xl md:text-4xl mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Filters Section */}
          <div 
            className="filter-reveal mb-12"
            style={{ animationDelay: '0.6s' }}
          >
            {/* Price Range Filters */}
            {/* <div className="mb-6">
              <h3 className="text-sm text-gray-500 tracking-widest mb-3 flex items-center gap-2">
                <DollarSign size={16} />
                PRICE RANGE
              </h3>
              <div className="flex flex-wrap gap-3">
                {priceRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setPriceRange(range.value)}
                    className={`price-filter px-5 py-3 font-bold text-sm tracking-wider transition-all ${
                      priceRange === range.value ? 'active' : ''
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div> */}

            {/* Sort and Count */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-white/5 border border-white/10">
              <div className="flex items-center gap-4">
                <Package className="text-gray-500" size={20} />
                <div>
                  <p className="text-white font-bold">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {priceRange !== 'all' ? `In ${priceRanges.find(r => r.value === priceRange)?.label}` : 'All prices'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <SortAsc className="text-gray-500" size={20} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select flex-1 md:flex-initial text-white px-4 py-3 cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader size="lg" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div 
              className="filter-reveal"
              style={{ animationDelay: '0.7s' }}
            >
              <ProductGrid products={filteredProducts} />
            </div>
          ) : products.length === 0 ? (
            /* Empty Store State */
            <div 
              className="empty-state filter-reveal p-12 text-center"
              style={{ animationDelay: '0.7s' }}
            >
              <ShoppingBag className="icon-float w-20 h-20 mx-auto mb-6 text-red-500" />
              <h2 className="shop-title text-4xl md:text-5xl text-white mb-4">
                COMING SOON
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                New drops are on the way. Check back soon or follow us on Instagram
                for updates and exclusive previews.
              </p>              
            </div>
          ) : (
            /* No Results in Filter State */
            <div 
              className="filter-reveal text-center py-20"
              style={{ animationDelay: '0.7s' }}
            >
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Package size={40} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  No items in this range
                </h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your price filter to see more items
                </p>
                <button
                  onClick={() => setPriceRange('all')}
                  className="px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors"
                >
                  VIEW ALL ITEMS
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;