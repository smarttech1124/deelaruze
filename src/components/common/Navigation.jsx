import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/about', label: 'ABOUT' },
    // { path: '/projects', label: 'PROJECTS' },
    { path: '/shop', label: 'SHOP' },
    { path: '/submit', label: 'SUBMIT' },
    { path: '/contact', label: 'CONTACT' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-black shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-black tracking-tighter hover:opacity-70 transition-opacity"
          >
            DEELARUZE
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-bold tracking-wide hover:text-gray-400 transition-colors ${
                  isActive(link.path)
                    ? 'text-white border-b-2 border-white'
                    : 'text-gray-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/cart"
              className="relative hover:opacity-70 transition-opacity"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden hover:opacity-70 transition-opacity"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block w-full text-left text-lg font-bold tracking-wide hover:text-gray-400 transition-colors ${
                  isActive(link.path) ? 'text-white' : 'text-gray-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/cart"
              className="flex items-center gap-2 text-lg font-bold text-gray-400 hover:text-white transition-colors"
            >
              <ShoppingCart size={20} />
              CART {cartCount > 0 && `(${cartCount})`}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;