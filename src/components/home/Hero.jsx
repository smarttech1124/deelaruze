import { useState, useEffect, useCallback } from 'react';
import { heroSlideService } from '../../services/contentService';

const FADE_MS = 500; // fade-out duration = fade-in duration
const AUTOPLAY_MS = 4000;
const MOBILE_QUERY = '(max-width: 767px)';

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );

  // targetSlide  → where we're heading (drives dots/arrows immediately)
  // visibleSlide → what's actually rendered (only swaps while opacity is 0)
  const [targetSlide, setTargetSlide] = useState(0);
  const [visibleSlide, setVisibleSlide] = useState(0);
  const [fading, setFading] = useState(false);

  /* ----------------------------- Data ----------------------------- */

  useEffect(() => {
    let mounted = true;

    const loadSlides = async () => {
      try {
        const response = await heroSlideService.getAll();
        if (mounted) setSlides(response.data || []);
      } catch (error) {
        console.error('Error loading hero slides:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSlides();
    return () => {
      mounted = false;
    };
  }, []);

  /* --------------------------- Responsive -------------------------- */

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event) => setIsMobile(event.matches);

    setIsMobile(mq.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  /* --------------------------- Navigation -------------------------- */

  const goToSlide = useCallback(
    (index) => {
      if (fading || index === targetSlide) return;

      setFading(true); // ① start fade-out
      setTargetSlide(index); // update dots immediately

      setTimeout(() => {
        setVisibleSlide(index); // ② swap content while invisible
        setFading(false); // ③ start fade-in
      }, FADE_MS);
    },
    [fading, targetSlide]
  );

  const nextSlide = useCallback(() => {
    if (slides.length < 2) return;
    goToSlide((targetSlide + 1) % slides.length);
  }, [goToSlide, targetSlide, slides.length]);

  const prevSlideFn = useCallback(() => {
    if (slides.length < 2) return;
    goToSlide((targetSlide - 1 + slides.length) % slides.length);
  }, [goToSlide, targetSlide, slides.length]);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = setInterval(nextSlide, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  /* ----------------------------- Render ---------------------------- */

  const slide = slides[visibleSlide];

  // Empty state — no published slides (or none loaded yet).
  if (!slide) {
    return (
      <section className="relative h-screen overflow-hidden bg-black flex items-center justify-center">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 30% 50%, rgba(255,51,102,0.12) 0%, transparent 55%), linear-gradient(135deg, rgba(0,0,0,0.4) 0%, transparent 50%, rgba(0,0,0,0.6) 100%)',
          }}
          aria-hidden="true"
        />
        {!loading && (
          <h1 className="relative z-10 text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tighter">
            DEELARUZE
          </h1>
        )}
      </section>
    );
  }

  const imageUrl = (isMobile && slide.mobileImage?.url) || slide.image?.url || '';

  // `placement` used to drive the text position; slides created before the
  // image/text split still carry their choice there.
  const textPlacement = slide.textPlacement || slide.placement || 'center';

  const alignItems =
    textPlacement === 'top'
      ? 'flex-start'
      : textPlacement === 'bottom'
        ? 'flex-end'
        : 'center';
  const justifyContent =
    textPlacement === 'left'
      ? 'flex-start'
      : textPlacement === 'right'
        ? 'flex-end'
        : 'center';

  const accent = slide.accent || '#FF3366';

  // Single shared fade style — drives both image and text together
  const fadeStyle = {
    opacity: fading ? 0 : 1,
    transform: fading ? 'scale(1.03)' : 'scale(1)',
    transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
  };

  return (
    <section className="relative h-screen overflow-hidden bg-black">

      {/* Background */}
      <div className="absolute inset-0 z-10">
        <div
          role="img"
          aria-label={slide.image?.alt || slide.title?.replace(/<[^>]*>/g, ' ') || 'Deelaruze artwork'}
          style={{
            ...fadeStyle,
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('${imageUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: slide.position || 'center center',
            filter: 'brightness(0.6) contrast(1.15) saturate(1.1)',
          }}
        />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background: `
              radial-gradient(circle at 30% 50%, ${accent}15 0%, transparent 50%),
              linear-gradient(135deg, rgba(0,0,0,0.4) 0%, transparent 50%, rgba(0,0,0,0.5) 100%)
            `,
          }}
        />
      </div>

      {/* Top scrim — keeps the navigation legible over bright artwork,
          independent of the accent colour chosen for the slide. */}
      <div
        className="absolute top-0 inset-x-0 h-48 md:h-56 z-20 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 45%, transparent 100%)',
        }}
      />

      {/* Grain */}
      <div
        className="grain-overlay absolute inset-0 z-20"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      {/* Extra top padding so 'top' text placement clears the fixed header */}
      <div className="hero-container relative z-30 h-full flex flex-col justify-between px-6 md:px-12 pt-28 md:pt-32 pb-12">

        {/* Center Text */}
        <div className="flex-1 flex" style={{ alignItems, justifyContent }}>
          <div
            className="text-center max-w-5xl"
            style={{
              ...fadeStyle,
              // Override transform to add the Y-slide for text only
              transform: fading
                ? 'translateY(20px) scale(0.98)'
                : 'translateY(0) scale(1)',
            }}
          >
            {slide.title && (
              <h2
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-none"
                dangerouslySetInnerHTML={{ __html: slide.title }}
              />
            )}
            {slide.description && (
              <p className="text-lg md:text-2xl text-gray-300 mt-4">
                {slide.description}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Controls */}
        {slides.length > 1 && (
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <button
                onClick={prevSlideFn}
                disabled={fading}
                className="nav-button"
                aria-label="Previous slide"
              >
                ‹
              </button>
              <button
                onClick={nextSlide}
                disabled={fading}
                className="nav-button"
                aria-label="Next slide"
              >
                ›
              </button>
            </div>

            <div className="flex gap-3">
              {slides.map((s, index) => (
                <button
                  key={s._id}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === targetSlide}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        index === targetSlide ? s.accent || '#FF3366' : '#ffffff66',
                      transform: index === targetSlide ? 'scale(1.3)' : 'scale(1)',
                      transition:
                        'transform 300ms ease, background-color 300ms ease',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSlider;
