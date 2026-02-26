import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const HeroSlider = () => {
  const slides = [
    {
      id: 1,
      image: '/images/main.jpeg',
      title: 'DEELARUZE',
      subtitle: '',
      description: '',
      accent: '#FF3366'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1594523960192-62b92c04089d?w=1600&h=1200&fit=crop',
      title: 'RAW CULTURE',
      subtitle: '',
      description: '',
      accent: '#00FF94'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1551225183-94acb7d595b6?w=1600&h=1200&fit=crop',
      title: 'UNDERGROUND',
      subtitle: '',
      description: '',
      accent: '#FFB800'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState('next');

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setDirection('next');
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [isTransitioning, slides.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setDirection('prev');
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [isTransitioning, slides.length]);

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return;
    setDirection(index > currentSlide ? 'next' : 'prev');
    setIsTransitioning(true);
    setCurrentSlide(index);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsTransitioning(false), 800);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  useEffect(() => {
    const autoPlayTimer = setInterval(nextSlide, 6000);
    return () => clearInterval(autoPlayTimer);
  }, [nextSlide]);

  const current = slides[currentSlide];

  return (
    <section className="relative h-screen overflow-hidden bg-black">

      {/* Background Images */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`
            slide-image
            absolute inset-0
            ${index === currentSlide ? 'z-10' : 'z-0'}
            ${isTransitioning && index === currentSlide ? 
              `transitioning-${direction}` : ''}
            ${!isTransitioning && index === currentSlide ? 
              `entering-${direction}` : ''}
          `}
          style={{
            opacity: index === currentSlide || isTransitioning ? 1 : 0,
            pointerEvents: index === currentSlide ? 'auto' : 'none'
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${slide.image}')`,
              filter: 'brightness(0.6) contrast(1.15) saturate(1.1)',
            }}
          />
          
          {/* Gradient Overlays */}
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
      ))}

      {/* Grain Texture */}
      <div 
        className="grain-overlay absolute inset-0 z-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Main Content */}
      <div className="hero-container relative z-30 h-full flex flex-col justify-between px-6 md:px-12 py-12">
        
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center">
          <div className="text-sm tracking-widest text-white/80">
            {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </div>
          <div className="flex gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="relative h-1 w-12 md:w-16 bg-white/20 overflow-hidden group"
                aria-label={`Go to slide ${index + 1}`}
              >
                <div 
                  className={`
                    absolute inset-0 bg-white origin-left
                    ${index === currentSlide && !isTransitioning ? 'progress-bar' : ''}
                    ${index < currentSlide ? 'scale-x-100' : 'scale-x-0'}
                  `}
                  style={{ transformOrigin: 'left' }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex items-center justify-center">
          <div 
            key={currentSlide}
            className="content-reveal text-center max-w-5xl"
          >
            {/* Accent Line */}
            <div 
              className="accent-glow h-1 w-24 mx-auto mb-8"
              style={{ 
                '--accent-color': current.accent,
                background: current.accent
              }}
            />

            <h1 className="hero-title text-5xl sm:text-7xl md:text-8xl lg:text-9xl mb-4 text-white leading-none">
              {current.title}
              <br />
              <span 
                style={{ color: current.accent }}
                className="block"
              >
                {current.subtitle}
              </span>
            </h1>
            
            <p className="text-lg md:text-2xl mb-12 text-gray-300 font-light tracking-wide max-w-2xl mx-auto">
              {current.description}
            </p>

            {/* CTA Buttons */}
            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/projects"
                className="cta-button px-10 py-5 bg-white text-black font-bold text-base md:text-lg tracking-wider hover:bg-opacity-90"
                style={{ 
                  borderLeft: `4px solid ${current.accent}`,
                }}
              >
                VIEW PROJECTS
              </Link>
              <Link
                to="/submit"
                className="cta-button px-10 py-5 border-2 border-white text-white font-bold text-base md:text-lg tracking-wider hover:border-opacity-80"
                style={{ 
                  borderColor: current.accent,
                  color: current.accent
                }}
              >
                SUBMIT YOUR ART
              </Link>
            </div> */}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center">
          {/* Navigation Arrows */}
          <div className="flex gap-4">
            <button
              onClick={prevSlide}
              className="nav-button w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/30"
              aria-label="Previous slide"
              disabled={isTransitioning}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="nav-button w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/30"
              aria-label="Next slide"
              disabled={isTransitioning}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dot Indicators */}
          <div className="flex gap-3">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className="dot group"
                aria-label={`Go to slide ${index + 1}`}
              >
                <div 
                  className={`
                    w-3 h-3 rounded-full transition-all
                    ${index === currentSlide 
                      ? 'scale-125 ring-2 ring-offset-2 ring-offset-black' 
                      : 'bg-white/40 hover:bg-white/60'
                    }
                  `}
                  style={{
                    backgroundColor: index === currentSlide ? slide.accent : undefined,
                    ringColor: index === currentSlide ? slide.accent : undefined
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 hidden md:flex flex-col items-center gap-2 text-white/60 animate-bounce">
        <span className="text-xs tracking-widest">SCROLL</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSlider;