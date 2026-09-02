import React, { useCallback, useEffect, useState } from 'react';
import { Sticker as StickerIcon, X } from 'lucide-react';
import { stickerService } from '../services/contentService';
import { usePageContent } from '../hooks/usePageContent';
import PageBackground from '../components/common/PageBackground';
import Loader from '../components/common/Loader';

const DEFAULTS = {
  title: 'STICKERS',
  subtitle: 'Slaps from the vault. Hand-drawn, street-tested.',
  description: '',
};

const Stickers = () => {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const { content } = usePageContent('stickers', DEFAULTS);

  useEffect(() => {
    let mounted = true;

    const loadStickers = async () => {
      try {
        const response = await stickerService.getAll();
        if (mounted) setStickers(response.data || []);
      } catch (error) {
        console.error('Error loading stickers:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStickers();
    return () => {
      mounted = false;
    };
  }, []);

  const closeLightbox = useCallback(() => setActiveIndex(null), []);

  // Keyboard control for the lightbox: Escape closes, arrows step through.
  useEffect(() => {
    if (activeIndex === null) return undefined;

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === 'ArrowRight') {
        setActiveIndex((i) => (i + 1) % stickers.length);
      } else if (event.key === 'ArrowLeft') {
        setActiveIndex((i) => (i - 1 + stickers.length) % stickers.length);
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [activeIndex, stickers.length, closeLightbox]);

  const activeSticker = activeIndex !== null ? stickers[activeIndex] : null;

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <PageBackground
        topAccent="#00D9FF"
        bottomAccent="#FF3366"
        topPosition="top-0 left-1/4"
        bottomPosition="bottom-0 right-1/4"
      />

      <div className="relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">

          {/* ── Page header ─────────────────────────────────────────────── */}
          <header className="mb-12 md:mb-16">
            <div className="hero-fade mb-6" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-4 sm:gap-6 mb-4">
                <StickerIcon
                  className="icon-float w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-cyan-400 flex-shrink-0"
                  aria-hidden="true"
                />
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
                  {content.title}
                </h1>
              </div>
            </div>

            {content.subtitle && (
              <p
                className="hero-fade text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed"
                style={{ animationDelay: '0.2s' }}
              >
                {content.subtitle}
              </p>
            )}

            {content.description && (
              <div
                className="hero-fade prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-300 break-words mt-8"
                style={{ animationDelay: '0.3s' }}
                dangerouslySetInnerHTML={{ __html: content.description }}
              />
            )}
          </header>

          {/* ── Gallery ─────────────────────────────────────────────────── */}
          {loading ? (
            <Loader size="lg" />
          ) : stickers.length === 0 ? (
            <div className="text-center py-20 border border-white/10 bg-white/[0.02]">
              <StickerIcon
                className="w-10 h-10 mx-auto mb-4 text-gray-700"
                aria-hidden="true"
              />
              <p className="text-xl sm:text-2xl text-gray-400">
                No stickers published yet
              </p>
              <p className="text-sm text-gray-600 mt-2">
                New drops are added regularly — check back soon.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 list-none p-0">
              {stickers.map((sticker, index) => (
                <li
                  key={sticker._id}
                  className="content-reveal"
                  style={{ animationDelay: `${Math.min(index, 12) * 0.05}s` }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className="sticker-tile group relative w-full aspect-square bg-white/[0.03] border border-white/10 overflow-hidden transition-colors duration-300 hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    aria-label={`View sticker artwork ${index + 1}`}
                  >
                    {sticker.image?.url ? (
                      <img
                        src={sticker.image.url}
                        alt={sticker.image.alt || 'Deelaruze sticker artwork'}
                        loading="lazy"
                        decoding="async"
                        // contain keeps mixed artwork ratios from cropping badly
                        className="w-full h-full object-contain p-3 sm:p-4 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">
                        <StickerIcon className="w-8 h-8" aria-hidden="true" />
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────── */}
      {activeSticker && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sticker artwork"
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 sm:p-8"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            autoFocus
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 border border-white/20 text-white hover:bg-white hover:text-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close artwork viewer"
          >
            <X size={20} />
          </button>

          <div
            className="max-w-4xl w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeSticker.image?.url}
              alt={activeSticker.image?.alt || 'Deelaruze sticker artwork'}
              className="max-h-[80vh] w-auto mx-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Stickers;
