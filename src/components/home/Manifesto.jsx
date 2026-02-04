const Manifesto = () => {
  return (
    <section className="relative py-32 px-4 md:px-8 bg-black overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&display=swap');

        .manifesto-container {
          font-family: 'Space Mono', monospace;
        }

        .manifesto-title {
          font-family: 'Archivo Black', sans-serif;
          letter-spacing: -0.02em;
        }

        .manifesto-fade-in {
          animation: manifestoFadeIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
        }

        @keyframes manifestoFadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .manifesto-text {
          animation: textReveal 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
        }

        @keyframes textReveal {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .accent-border {
          position: relative;
          overflow: hidden;
        }

        .accent-border::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 4px;
          background: linear-gradient(180deg, #FF3366 0%, #FFB800 50%, #00FF94 100%);
          animation: borderGlow 3s ease-in-out infinite;
        }

        @keyframes borderGlow {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 20px #FF3366;
          }
          50% {
            opacity: 0.6;
            box-shadow: 0 0 40px #00FF94;
          }
        }

        .quote-mark {
          font-family: 'Archivo Black', sans-serif;
          font-size: 120px;
          line-height: 0;
          opacity: 0.1;
          position: absolute;
          color: #FF3366;
        }

        .noise-bg {
          opacity: 0.03;
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        .grid-pattern {
          background-image: 
            linear-gradient(rgba(255, 51, 102, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 51, 102, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.5;
        }

        .text-highlight {
          position: relative;
          display: inline-block;
        }

        .text-highlight::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 0;
          width: 100%;
          height: 8px;
          background: #FF3366;
          opacity: 0.3;
          z-index: -1;
          transform: skewX(-12deg);
        }

        .mission-badge {
          display: inline-block;
          padding: 8px 20px;
          background: rgba(255, 51, 102, 0.1);
          border: 2px solid #FF3366;
          color: #FF3366;
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 0.2em;
          margin-bottom: 24px;
          animation: badgePulse 2s ease-in-out infinite;
        }

        @keyframes badgePulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 51, 102, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 51, 102, 0.5);
          }
        }

        .diagonal-line {
          position: absolute;
          height: 2px;
          background: linear-gradient(90deg, transparent, #FF3366, transparent);
          transform: rotate(-12deg);
          animation: diagonalMove 4s linear infinite;
        }

        @keyframes diagonalMove {
          0% {
            left: -100%;
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            left: 200%;
            opacity: 0;
          }
        }
      `}</style>

      {/* Background Elements */}
      <div className="absolute inset-0 grid-pattern" />
      <div 
        className="noise-bg absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Animated Diagonal Lines */}
      <div className="diagonal-line top-1/4 w-full" style={{ animationDelay: '0s' }} />
      <div className="diagonal-line top-2/4 w-full" style={{ animationDelay: '1.5s' }} />
      <div className="diagonal-line top-3/4 w-full" style={{ animationDelay: '3s' }} />

      {/* Radial Gradient Accent */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, #FF3366 0%, transparent 70%)'
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, #00FF94 0%, transparent 70%)'
        }}
      />

      <div className="manifesto-container relative z-10 max-w-5xl mx-auto">
        {/* Section Badge */}
        <div className="manifesto-fade-in text-center md:text-left">
          <div className="mission-badge">
            SECTION 01
          </div>
        </div>

        {/* Title */}
        <div className="manifesto-fade-in mb-16" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-6 mb-4">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            <h2 className="manifesto-title text-5xl md:text-7xl lg:text-8xl text-white tracking-tight">
              THE <span className="text-red-500">MISSION</span>
            </h2>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-red-500/50 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="accent-border pl-8 md:pl-12 space-y-8 relative">
          {/* Decorative Quote Mark */}
          <div className="quote-mark hidden md:block" style={{ top: '-40px', left: '-60px' }}>
            "
          </div>

          <p 
            className="manifesto-text text-xl md:text-2xl text-gray-300 leading-relaxed font-light"
            style={{ animationDelay: '0.4s' }}
          >
            We don't curate. We <span className="text-highlight text-white font-bold">amplify</span>. 
            Street art isn't meant for galleries—it belongs to the people, the walls, the forgotten
            corners where creativity refuses to be silenced.
          </p>

          <p 
            className="manifesto-text text-xl md:text-2xl text-gray-300 leading-relaxed font-light"
            style={{ animationDelay: '0.6s' }}
          >
            Deelaruze exists to document, publish, and celebrate the raw
            energy of global street culture. No corporate polish. No
            gatekeepers. Just artists doing what they do best: making the
            world more interesting, one piece at a time.
          </p>

          {/* Final Statement Box */}
          <div 
            className="manifesto-text relative mt-12 p-8 md:p-10"
            style={{ 
              animationDelay: '0.8s',
              background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.1) 0%, rgba(0, 255, 148, 0.05) 100%)',
              border: '2px solid',
              borderImage: 'linear-gradient(135deg, #FF3366, #00FF94) 1',
              clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
            }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-2 h-2 mt-3 bg-red-500 rounded-full animate-pulse" />
              <p className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight">
                This is DIY. This is independent.{' '}
                <span 
                  className="inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #FF3366 0%, #FFB800 50%, #00FF94 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  This is ours.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Accent Line */}
        <div 
          className="manifesto-fade-in mt-16 h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent"
          style={{ animationDelay: '1s' }}
        />

        {/* Visual Counter */}
        <div 
          className="manifesto-fade-in mt-8 flex justify-between items-center text-gray-600 text-sm tracking-widest"
          style={{ animationDelay: '1.2s' }}
        >
          <span>EST. 2024</span>
          <span className="text-red-500">///</span>
          <span>INDEPENDENT PUBLISHING</span>
        </div>
      </div>
    </section>
  );
};

export default Manifesto;