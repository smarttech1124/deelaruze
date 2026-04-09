import { useState, useEffect, useCallback } from 'react';

const HeroSlider = () => {
  const slides = [
    {
      id: 1,
      image: '/images/tt.jpeg',
      title: '',
      description: '',
      accent: '#FF3366',
      position: 'center center',
      placement: null
    },
    {
      id: 2,
      image: '/images/PIC 1.jpg',
      title: '',
      description: '',
      accent: '#FF3366',
      position: 'center top',
      placement: null
    },
    {
      id: 3,
      image: '/images/PIC 2.jpeg',
      title: '',
      description: '',
      accent: '#FF3366',
      position: 'center top',
      placement: null
    },
    {
      id: 4,
      image: '/images/PIC 3.JPG',
      title: 'WE DONT RIDE THE WAVE <br/>WE CREATE IT',
      description: '',
      accent: '#FF3366',
      position: 'center bottom',
      placement: 'right'
    },
    {
      id: 5,
      image: '/images/PIC 4.JPG',
      title: '',
      description: '',
      accent: '#FF3366',
      position: 'center top',
      placement: null
    },
    {
      id: 6,
      image: '/images/PIC 5.jpg',
      title: 'THE EYES ARE USELESS <br/> WHEN MIND IS BLIND',
      description: '',
      accent: '#FF3366',
      position: 'center center',
      placement: null
    },
    {
      id: 7,
      image: '/images/PIC 6.jpg',
      title: 'POWER TO THE PEOPLE',
      description: '',
      accent: '#FF3366',
      position: 'center center',
      placement: 'top'
    },
    {
      id: 8,
      image: '/images/PIC 7.jpg',
      title: '',
      description: '',
      accent: '#FF3366',
      position: 'center center',
      placement: null
    },
    {
      id: 9,
      image: '/images/PIC 8.JPG',
      title: 'INCREASE THE PEACE',
      description: '',
      accent: '#FF3366',
      position: 'center center',
      placement: 'bottom'
    }
  ];

  const FADE_MS = 500; // fade-out duration = fade-in duration

  // targetSlide  → where we're heading (drives dots/arrows immediately)
  // visibleSlide → what's actually rendered (only swaps while opacity is 0)
  const [targetSlide, setTargetSlide]   = useState(0);
  const [visibleSlide, setVisibleSlide] = useState(0);
  const [fading, setFading]             = useState(false);

  const goToSlide = useCallback((index) => {
    if (fading || index === targetSlide) return;

    setFading(true);       // ① start fade-out
    setTargetSlide(index); // update dots immediately

    setTimeout(() => {
      setVisibleSlide(index); // ② swap content while invisible
      setFading(false);       // ③ start fade-in
    }, FADE_MS);
  }, [fading, targetSlide]);

  const nextSlide = useCallback(() => {
    goToSlide((targetSlide + 1) % slides.length);
  }, [goToSlide, targetSlide, slides.length]);

  const prevSlideFn = useCallback(() => {
    goToSlide((targetSlide - 1 + slides.length) % slides.length);
  }, [goToSlide, targetSlide, slides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = slides[visibleSlide]; // always render the visible slide's content

  const alignItems    = slide.placement === 'top'    ? 'flex-start'
                      : slide.placement === 'bottom' ? 'flex-end'
                      : 'center';
  const justifyContent = slide.placement === 'left'  ? 'flex-start'
                       : slide.placement === 'right' ? 'flex-end'
                       : 'center';

  // Single shared fade style — drives both image and text together
  const fadeStyle = {
    opacity:    fading ? 0 : 1,
    transform:  fading ? 'scale(1.03)' : 'scale(1)',
    transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
  };

  return (
    <section className="relative h-screen overflow-hidden bg-black">

      {/* Background */}
      <div className="absolute inset-0 z-10">
        <div
          style={{
            ...fadeStyle,
            position: 'absolute', inset: 0,
            backgroundImage:    `url('${slide.image}')`,
            backgroundSize:     'cover',
            backgroundPosition: slide.position,
            filter: 'brightness(0.6) contrast(1.15) saturate(1.1)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 30% 50%, ${slide.accent}15 0%, transparent 50%),
              linear-gradient(135deg, rgba(0,0,0,0.4) 0%, transparent 50%, rgba(0,0,0,0.5) 100%)
            `
          }}
        />
      </div>

      {/* Grain */}
      <div
        className="grain-overlay absolute inset-0 z-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Content */}
      <div className="hero-container relative z-30 h-full flex flex-col justify-between px-6 md:px-12 py-12">

        {/* Center Text */}
        <div className="flex-1 flex" style={{ alignItems, justifyContent }}>
          <div
            className="text-center max-w-5xl"
            style={{
              ...fadeStyle,
              // Override transform to add the Y-slide for text only
              transform: fading ? 'translateY(20px) scale(0.98)' : 'translateY(0) scale(1)',
            }}
          >
            <h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-none"
              dangerouslySetInnerHTML={{ __html: slide.title }}
            />
            {slide.description && (
              <p className="text-lg md:text-2xl text-gray-300 mt-4">
                {slide.description}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <button onClick={prevSlideFn} disabled={fading} className="nav-button">‹</button>
            <button onClick={nextSlide}   disabled={fading} className="nav-button">›</button>
          </div>

          <div className="flex gap-3">
            {slides.map((s, index) => (
              <button key={s.id} onClick={() => goToSlide(index)}>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: index === targetSlide ? s.accent : '#ffffff66',
                    transform:   index === targetSlide ? 'scale(1.3)' : 'scale(1)',
                    transition:  'transform 300ms ease, background-color 300ms ease',
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;