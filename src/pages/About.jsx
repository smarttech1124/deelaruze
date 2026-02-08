import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Users, Heart, Zap } from 'lucide-react';

const About = () => {
  const stats = [
    { value: '200+', label: 'Artists', icon: Users },
    { value: '40+', label: 'Countries', icon: Globe },
    { value: '15K+', label: 'Community', icon: Heart },
    { value: '100%', label: 'Independent', icon: Zap },
  ];

  const values = [
    {
      title: 'Authenticity over polish',
      description: 'Raw beats refined every time',
      color: '#FF3366'
    },
    {
      title: 'Community over commerce',
      description: 'Artists first, always',
      color: '#FFB800'
    },
    {
      title: 'Independence over institutional',
      description: 'DIY or die',
      color: '#00FF94'
    },
    {
      title: 'Global over local',
      description: 'Street art has no borders',
      color: '#00D9FF'
    }
  ];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 grid-bg" />
      <div 
        className="fixed inset-0 opacity-3"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
          pointerEvents: 'none'
        }}
      />

      {/* Gradient Accents */}
      <div 
        className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
        style={{ background: 'radial-gradient(circle, #FF3366 0%, transparent 70%)' }}
      />
      <div 
        className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
        style={{ background: 'radial-gradient(circle, #00FF94 0%, transparent 70%)' }}
      />

      <div className="about-container relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="mb-20">
            {/* <div className="section-badge hero-fade">
              OUR STORY
            </div> */}
            <h1 
              className="about-title hero-fade text-6xl md:text-8xl lg:text-9xl mb-8 text-white"
              style={{ animationDelay: '0.1s' }}
            >
              ABOUT
              <br />
              <span 
                className="inline-block"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F2F2F2 50%, #DADADA 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                DEELARUZE
              </span>
            </h1>
            {/* <div 
              className="hero-fade h-1 w-32 bg-gradient-to-r from-red-500 to-green-500"
              style={{ animationDelay: '0.2s' }}
            /> */}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="stat-card p-6 text-center content-reveal"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <stat.icon className="icon-float w-8 h-8 mx-auto mb-3 text-red-500" />
                <div className="about-title text-4xl mb-2 text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

         

          {/* Main Content */}
          <div className="space-y-8 text-lg text-gray-300 leading-relaxed mb-20">
            <p className="content-reveal" style={{ animationDelay: '0.8s' }}>
              Deelaruze, Slovakian street artist living in London for last 21 years.
              I grew up in communism, raised by old skool hip hop and always interested in the Culture.
              I moved to London in 2004 and street art blowed my mind. First, I was doing my own pieces on
              canvas, I had few exhibits, showcases with different artists, very much enjoyable live paintings, while
              my homies, DJs and MCs were playing. Later I found magic in stickers, which gave me time to prepare
              it with the detail, play with letters and metallic gold and silver markers, and then stick it in seconds in
              the streets. To this day I am old skool, freestyle/freehand.
            </p>

            <p className="content-reveal" style={{ animationDelay: '0.9s' }}>
              Street art is the way how you can reach the biggest audience of people, naturally and for free. Street art is for everyone. 
              For me, it’s the most beautiful way of activism. It’s my message. It’s my freedom.
              My stickers are now in many countries and streets, way before I am there or maybe never will be. My message, 
              the impact it can have on someone, to think, to smile. My sticker is in that city. I was there.
            </p>
          </div>

          {/* Values Section */}
          {/* <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-12 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              <h2 className="about-title text-4xl md:text-5xl text-white">
                OUR VALUES
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="value-card content-reveal"
                  style={{ 
                    borderLeftColor: value.color,
                    animationDelay: `${1.0 + index * 0.1}s` 
                  }}
                >
                  <h3 className="text-xl font-bold text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-400">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div> */}


          {/* Process Section */}
          {/* <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-12 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
              <h2 className="about-title text-4xl md:text-5xl text-white">
                THE PROCESS
              </h2>
            </div>

            <div 
              className="content-reveal bg-gradient-to-br from-gray-900/80 to-black/80 p-8 md:p-12 border border-white/10"
              style={{ animationDelay: '1.5s' }}
            >
              <p className="text-gray-300 mb-8 text-lg">
                We don't curate in the traditional sense. We amplify. Our process is simple:
              </p>
              
              <div className="space-y-6">
                {[
                  'Artists submit their work through our open platform',
                  'We review every submission with respect and consideration',
                  'Selected works are published in our quarterly volumes',
                  'Profits are shared with contributing artists',
                  'The community grows stronger'
                ].map((step, index) => (
                  <div key={index} className="process-step text-gray-300">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default About;