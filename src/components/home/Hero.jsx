import { useState, useEffect, useCallback, useRef } from 'react';
import { heroSlideService } from '../../services/contentService';

const FADE_MS = 500; // crossfade duration for both the text swap and the background
const AUTOPLAY_MS = 7000; // how long each slide stays on screen before advancing
const MOBILE_QUERY = '(max-width: 767px)';

// The image actually shown for a slide on the current device.
const imageUrlFor = (slide, isMobile) =>
  (isMobile && slide?.mobileImage?.url) || slide?.image?.url || '';

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );

  // targetSlide  → where we're heading (drives dots/arrows immediately)
  // visibleSlide → the slide whose TEXT is on screen (swaps at the fade midpoint)
  const [targetSlide, setTargetSlide] = useState(0);
  const [visibleSlide, setVisibleSlide] = useState(0);
  const [fading, setFading] = useState(false);

  // The background is two stacked layers that crossfade into one another —
  // whichever layer isn't active gets pointed at the incoming slide's image
  // while still fully transparent, then the two swap opacity together. That
  // way the section's black base is never exposed: unlike a single layer
  // that fades to 0, swaps its source, and fades back in, there is no instant
  // where nothing is painted (and nothing waiting on a still-loading image).
  const [bgLayers, setBgLayers] = useState([0, 0]); // slide index shown by [layer0, layer1]
  const [activeBgLayer, setActiveBgLayer] = useState(0);

  /* ----------------------------- Data ----------------------------- */

  const mountedRef = useRef(true);
  const preloadedUrls = useRef(new Set());

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // The API returns published slides already in the admin-defined order, so the
  // array is rendered exactly as received — the saved order is the source of truth.
  const loadSlides = useCallback(async () => {
    try {
      const response = await heroSlideService.getAll();
      if (mountedRef.current) setSlides(response.data || []);
    } catch (error) {
      console.error('Error loading hero slides:', error);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlides();
  }, [loadSlides]);

  // Pick up admin changes (a new order, added or unpublished slides) when the
  // visitor returns to the tab, so the carousel does not need a hard refresh.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') loadSlides();
    };

    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);

    return () => {
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [loadSlides]);

  // Keep the carousel position valid if the published set shrinks.
  useEffect(() => {
    if (slides.length === 0) return;

    setTargetSlide((current) => (current < slides.length ? current : 0));
    setVisibleSlide((current) => (current < slides.length ? current : 0));
    setBgLayers((prev) => prev.map((i) => (i < slides.length ? i : 0)));
  }, [slides.length]);

  /* --------------------------- Responsive -------------------------- */

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event) => setIsMobile(event.matches);

    setIsMobile(mq.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  /* --------------------------- Preloading --------------------------- */

  // Warms the browser's cache for every slide's image so a transition never
  // has to wait on a network fetch mid-fade — that wait is what exposes the
  // section's black background as a flicker.
  const preloadImage = useCallback((url) => {
    if (!url || preloadedUrls.current.has(url)) return Promise.resolve();

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        preloadedUrls.current.add(url);
        resolve();
      };
      img.onerror = () => resolve(); // never block a transition on a broken URL
      img.src = url;
    });
  }, []);

  useEffect(() => {
    slides.forEach((s) => preloadImage(imageUrlFor(s, isMobile)));
  }, [slides, isMobile, preloadImage]);

  /* --------------------------- Navigation -------------------------- */

  const goToSlide = useCallback(
    (index) => {
      if (fading || index === targetSlide) return;

      const targetSlideObj = slides[index];
      if (!targetSlideObj) return;

      setFading(true); // dots/arrows react immediately
      setTargetSlide(index);

      // Reveals the incoming image only once it's actually ready — if it's
      // already preloaded this resolves instantly, otherwise the outgoing
      // slide simply stays on screen a little longer instead of cutting to
      // black while the new one downloads.
      const runTransition = () => {
        const nextLayer = activeBgLayer === 0 ? 1 : 0;

        setBgLayers((prev) => {
          const next = [...prev];
          next[nextLayer] = index;
          return next;
        });
        setActiveBgLayer(nextLayer);

        setTimeout(() => {
          setVisibleSlide(index); // swap the text content
          setFading(false);
        }, FADE_MS);
      };

      const url = imageUrlFor(targetSlideObj, isMobile);
      if (url && !preloadedUrls.current.has(url)) {
        preloadImage(url).then(runTransition);
      } else {
        runTransition();
      }
    },
    [fading, targetSlide, slides, isMobile, preloadImage, activeBgLayer]
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

  // Drives the text block's own fade — the background crossfades separately
  // via the two bgLayers below, on the same duration.
  const textFadeStyle = {
    opacity: fading ? 0 : 1,
    transform: fading ? 'scale(1.03)' : 'scale(1)',
    transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
  };

  return (
    <section className="relative h-screen overflow-hidden bg-black">

      {/* Background — two layers crossfading into one another, see goToSlide */}
      <div className="absolute inset-0 z-10">
        {bgLayers.map((slideIndex, layerNum) => {
          const layerSlide = slides[slideIndex];
          if (!layerSlide) return null;

          const isActive = layerNum === activeBgLayer;

          return (
            <div
              key={layerNum}
              role={isActive ? 'img' : undefined}
              aria-hidden={isActive ? undefined : true}
              aria-label={
                isActive
                  ? layerSlide.image?.alt ||
                    layerSlide.title?.replace(/<[^>]*>/g, ' ') ||
                    'Deelaruze artwork'
                  : undefined
              }
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('${imageUrlFor(layerSlide, isMobile)}')`,
                backgroundSize: 'cover',
                backgroundPosition: layerSlide.position || 'center center',
                filter: 'brightness(0.6) contrast(1.15) saturate(1.1)',
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'scale(1)' : 'scale(1.03)',
                transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
              }}
            />
          );
        })}
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
              ...textFadeStyle,
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
