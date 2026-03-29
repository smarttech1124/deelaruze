import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, ArrowUpRight, Send } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black overflow-hidden">

      {/* Background Elements */}
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div 
        className="absolute inset-0 opacity-3"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
          pointerEvents: 'none'
        }}
      />

      {/* Top Gradient Line */}
      {/* <div className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" /> */}

      <div className="footer-container relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-12 gap-12 mb-16">
          {/* Brand Section - Spans 4 columns */}
          <div className="md:col-span-5 fade-in" style={{ animationDelay: '0s' }}>
            {/* <div className="accent-badge mb-4">EST. 2024</div> */}
            <h3 
              className="glitch-text footer-brand text-4xl md:text-5xl mb-4 text-white"
              data-text="DEELARUZE"
            >
              DEELARUZE
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              Independent art publishing for the underground. Built for the streets, by the streets.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 mb-8">
              <a
                href="https://instagram.com/deelaruze"
                target="_blank"
                rel="noopener noreferrer"
                className="social-button"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="mailto:contact@deelaruze.com"
                className="social-button"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
              <a
                href="#"
                className="social-button"
                aria-label="External Link"
              >
                <ArrowUpRight size={20} />
              </a>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-xs font-bold tracking-widest text-gray-500 mb-3">
                STAY UPDATED
              </h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="newsletter-input flex-1 px-4 py-3 text-sm text-white"
                />
                <button
                  className="newsletter-button px-4 py-3 text-white font-bold"
                  aria-label="Subscribe"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Navigate Section */}
          <div
            className="md:col-span-3 fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            <h4 className="section-title font-bold text-sm tracking-widest text-white">
              NAVIGATE
            </h4>

            <div className="flex flex-col space-y-3 text-sm text-gray-400">
              <Link to="/about" className="footer-link">
                About
              </Link>
              <Link to="/projects" className="footer-link">
                Projects
              </Link>
              <Link to="/shop" className="footer-link">
                Shop
              </Link>
              <Link to="/submit" className="footer-link">
                Submit
              </Link>
              <Link to="/contact" className="footer-link">
                Contact
              </Link>
            </div>
          </div>


          {/* Connect Section */}
          <div className="md:col-span-3 fade-in" style={{ animationDelay: '0.2s' }}>
            <h4 className="section-title font-bold text-sm tracking-widest text-white">
              CONNECT
            </h4>
            <div className="flex flex-col space-y-3 text-sm text-gray-400">
              <a
                href="https://instagram.com/deelaruze"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link block"
              >
                Instagram →
              </a>
              <a
                href="mailto:contact@deelaruze.com"
                className="footer-link block"
              >
                Email →
              </a>
              <Link to="/contact" className="footer-link block">
                Contact Form →
              </Link>
              <a
                href="#"
                className="footer-link block"
              >
                Newsletter →
              </a>
            </div>
          </div>

          {/* Legal Section */}
          {/* <div className="md:col-span-3 fade-in" style={{ animationDelay: '0.3s' }}>
            <h4 className="section-title font-bold text-sm tracking-widest text-white">
              LEGAL
            </h4>
            <div className="flex flex-col space-y-3 text-sm text-gray-400">
              <Link to="/privacy" className="footer-link block">
                Privacy Policy
              </Link>
              <Link to="/terms" className="footer-link block">
                Terms of Service
              </Link>
              <Link to="/shipping" className="footer-link block">
                Shipping Info
              </Link>
              <Link to="/returns" className="footer-link block">
                Returns & Refunds
              </Link>
            </div>
          </div> */}
        </div>

        {/* Divider with Accent */}
        <div className="relative mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"
            style={{
              boxShadow: '0 0 20px rgba(255, 51, 102, 0.6)'
            }}
          />
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <span>© {currentYear} DEELARUZE</span>
            <span className="text-red-500">///</span>
            <span>ALL RIGHTS RESERVED</span>
          </div>

          <div className="flex items-center gap-3">
            <span>DESIGNED WITH</span>
            <span 
              className="inline-block w-3 h-3 bg-red-500 animate-pulse"
              style={{
                clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
              }}
            />
            <span>FOR THE CULTURE</span>
          </div>

          <div className="flex items-center gap-2 tracking-widest">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-500">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Accent */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
        style={{
          opacity: 0.3
        }}
      />
    </footer>
  );
};

export default Footer;