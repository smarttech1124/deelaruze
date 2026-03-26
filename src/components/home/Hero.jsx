import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const HeroSlider = () => {
  const slides = [
    {
      id: 1,
      image: '/images/PIC 1.jpg',
      title: '',
      subtitle: '',
      description: '',
      accent: '#FF3366',
      prev_position: 'absolute inset-0 bg-cover bg-[center_top]',
      next_position: 'absolute inset-0 bg-cover bg-[center_top] transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
    },
    {
      id: 2,
      image: '/images/PIC 2.jpeg',
      title: '',
      subtitle: '',
      description: '',
      accent: '#FF3366',
      prev_position: 'absolute inset-0 bg-cover bg-[center_top]',
      next_position: 'absolute inset-0 bg-cover bg-[center_top] transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
    },
    {
      id: 3,
      image: '/images/PIC 3.JPG',
      title: 'WE DONT RIDE THE WAVE <br/>WE CREATE IT',
      subtitle: '',
      description: '',
      accent: '#FF3366',
      prev_position: 'absolute inset-0 bg-cover bg-[center_bottom]',
      next_position: 'absolute inset-0 bg-cover bg-[center_bottom] transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
    },
    {
      id: 4,
      image: '/images/PIC 4.JPG',
      title: '',
      subtitle: '',
      description: '',
      accent: '#FF3366',
      prev_position: 'absolute inset-0 bg-cover bg-[center_top]',
      next_position: 'absolute inset-0 bg-cover bg-[center_top] transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
    },
    {
      id: 5,
      image: '/images/PIC 5.jpg',
      title: 'THE EYES ARE USELESS <br/> WHEN MIND IS BLIND',
      subtitle: '',
      description: '',
      accent: '#FF3366',
      prev_position: 'absolute inset-0 bg-cover bg-[center_center]',
      next_position: 'absolute inset-0 bg-cover bg-[center_center] transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
    },
    {
      id: 6,
      image: '/images/PIC 6.jpg',
      title: 'POWER TO THE PEOPLE',
      subtitle: '',
      description: '',
      accent: '#FF3366',
      prev_position: 'absolute inset-0 bg-cover bg-[center_center]',
      next_position: 'absolute inset-0 bg-cover bg-[center_center] transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
    },
    {
      id: 7,
      image: '/images/PIC 7.jpg',
      title: '',
      subtitle: '',
      description: '',
      accent: '#FF3366',
      prev_position: 'absolute inset-0 bg-cover bg-[center_center]',
      next_position: 'absolute inset-0 bg-cover bg-[center_center] transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
    },
    {
      id: 8,
      image: '/images/PIC 8.JPG',
      title: 'INCREASE THE PEACE',
      subtitle: '',
      description: '',
      accent: '#FF3366',
      prev_position: 'absolute inset-0 bg-cover bg-[center_center]',
      next_position: 'absolute inset-0 bg-cover bg-[center_center] transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
    },
    {
      id: 9,
      image: '/images/PIC 9.JPG',
      title: '',
      subtitle: '',
      description: '',
      accent: '#FF3366',
      prev_position: 'absolute inset-0 bg-cover bg-[center_center]',
      next_position: 'absolute inset-0 bg-cover bg-[center_center] transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState('next');

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setPrevSlide(currentSlide);
    setDirection('next');
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [isTransitioning, currentSlide, slides.length]);

  const prevSlideFn = useCallback(() => {
    if (isTransitioning) return;
    setPrevSlide(currentSlide);
    setDirection('prev');
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [isTransitioning, currentSlide, slides.length]);

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return;
    setPrevSlide(currentSlide);
    setDirection(index > currentSlide ? 'next' : 'prev');
    setIsTransitioning(true);
    setCurrentSlide(index);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsTransitioning(false), 1000);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  useEffect(() => {
    const autoPlayTimer = setInterval(nextSlide, 6000);
    return () => clearInterval(autoPlayTimer);
  }, [nextSlide]);

  const current = slides[currentSlide];
  const previous = slides[prevSlide];

  return (
    <section className="relative h-screen overflow-hidden bg-black">

      {/* Background Layers */}
      <div className="absolute inset-0 z-10 overflow-hidden">

        {/* Previous Image */}
        <div
          className={previous.prev_position}
          style={{
            backgroundImage: `url('${previous.image}')`,
            filter: 'brightness(0.6) contrast(1.15) saturate(1.1)',
            transform: 'scale(1)'
          }}
        />

        {/* Current Image (fades in) */}
        <div
          key={currentSlide}
          className={current.next_position}
          style={{
            backgroundImage: `url('${current.image}')`,
            filter: 'brightness(0.6) contrast(1.15) saturate(1.1)',
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? 'scale(1.05)' : 'scale(1)'
          }}
        />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0" 
            style={{
              background: `
                radial-gradient(circle at 30% 50%, ${current.accent}15 0%, transparent 50%),
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
        
        {/* Top Bar */}
        {/* <div className="flex justify-between items-center">
          <div className="text-sm tracking-widest text-white/80">
            {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </div>

          <div className="flex gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="relative h-1 w-12 md:w-16 bg-white/20 overflow-hidden"
              >
                <div 
                  className="absolute inset-0 bg-white transition-all duration-500"
                  style={{
                    width: index === currentSlide ? '100%' : '0%'
                  }}
                />
              </button>
            ))}
          </div>
        </div> */}

        {/* Center Content */}
        <div className="flex-1 flex items-center justify-center">
          <div 
            key={currentSlide}
            className="text-center max-w-5xl transition-all duration-1000"
            style={{
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning
                ? 'translateY(40px) scale(0.98)'
                : 'translateY(0) scale(1)'
            }}
          >
            {/* Accent */}
            {/* <div 
              className="h-1 w-24 mx-auto mb-8 transition-all duration-700"
              style={{ 
                background: current.accent,
                boxShadow: `0 0 20px ${current.accent}`,
                transform: isTransitioning ? 'scaleX(0.6)' : 'scaleX(1)'
              }}
            /> */}

            <h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-none"
              dangerouslySetInnerHTML={{ __html: current.title }}
            />

            <p className="text-lg md:text-2xl text-gray-300 mt-4">
              {current.description}
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex justify-between items-center">
          
          {/* Arrows */}
          <div className="flex gap-4">
            <button onClick={prevSlideFn} disabled={isTransitioning} className="nav-button">
              ‹
            </button>
            <button onClick={nextSlide} disabled={isTransitioning} className="nav-button">
              ›
            </button>
          </div>

          {/* Dots */}
          <div className="flex gap-3">
            {slides.map((slide, index) => (
              <button key={slide.id} onClick={() => goToSlide(index)}>
                <div 
                  className="w-3 h-3 rounded-full transition-all"
                  style={{
                    backgroundColor: index === currentSlide ? slide.accent : '#ffffff66',
                    transform: index === currentSlide ? 'scale(1.3)' : 'scale(1)'
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