const Manifesto = () => {
  return (
    <section className="relative py-32 px-4 md:px-8 bg-black overflow-hidden">


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
          {/* <div className="mission-badge">
            SECTION 01
          </div> */}
        </div>

        {/* Title */}
        <div className="manifesto-fade-in mb-16" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-6 mb-4">
            <h2 className="manifesto-title text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
              THE <span className="text-red-500">MISSION</span>
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="pl-8 md:pl-12 space-y-8 relative">
          {/* Decorative Quote Mark */}
          <div className="quote-mark hidden md:block" style={{ top: '-40px', left: '-60px' }}>
            "
          </div>

          <p 
            className="manifesto-text text-xl md:text-2xl text-gray-300 leading-relaxed font-light"
            style={{ animationDelay: '0.4s' }}
          >
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
        </div>

        {/* Bottom Accent Line */}
        {/* <div 
          className="manifesto-fade-in mt-16 h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent"
          style={{ animationDelay: '1s' }}
        /> */}

        {/* Visual Counter */}
        {/* <div 
          className="manifesto-fade-in mt-8 flex justify-between items-center text-gray-600 text-sm tracking-widest"
          style={{ animationDelay: '1.2s' }}
        >
          <span>EST. 2024</span>
          <span className="text-red-500">///</span>
          <span>INDEPENDENT PUBLISHING</span>
        </div> */}
      </div>
    </section>
  );
};

export default Manifesto;