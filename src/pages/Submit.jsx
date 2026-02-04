import React from 'react';
import SubmissionForm from '../components/forms/SubmissionForm';
import { Upload, CheckCircle, Image, FileText, Award, Users, ArrowRight } from 'lucide-react';

const Submit = () => {
  const criteria = [
    { icon: Image, title: 'Street art, graffiti, and sticker art', color: '#FF3366' },
    { icon: FileText, title: 'Photography documenting urban art culture', color: '#FFB800' },
    { icon: Award, title: 'Original designs with underground energy', color: '#00FF94' },
    { icon: Users, title: 'Work that challenges, provokes, or inspires', color: '#00D9FF' },
    { icon: CheckCircle, title: 'Authenticity above all else', color: '#9D4EDD' },
  ];

  const guidelines = [
    { 
      label: 'Quality', 
      detail: 'Submit high-resolution images (minimum 2000px on the longest side)',
      icon: '01'
    },
    { 
      label: 'Originality', 
      detail: 'Only submit work that you\'ve created yourself',
      icon: '02'
    },
    { 
      label: 'Format', 
      detail: 'JPG or PNG files, max 10MB per image',
      icon: '03'
    },
    { 
      label: 'Quantity', 
      detail: 'Submit 3-10 images that best represent your style',
      icon: '04'
    },
    { 
      label: 'Rights', 
      detail: 'By submitting, you confirm you own the rights to your work',
      icon: '05'
    },
  ];

  const processSteps = [
    'We review every submission within 2-3 weeks',
    'If your work is selected, we\'ll reach out via email',
    'We\'ll discuss publication details and compensation',
    'Your work gets featured in our next publication',
    'You join a global community of street artists'
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

      <div className="submit-container relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="mb-20">
            <div className="section-badge hero-fade">
              OPEN CALL
            </div>

            <div className="hero-fade mb-6" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-6 mb-4">
                <Upload className="upload-icon-pulse w-12 h-12 md:w-16 md:h-16 text-red-500" />
                <h1 className="submit-title text-6xl md:text-8xl lg:text-9xl text-white tracking-tight leading-none">
                  SUBMIT
                  <br />
                  <span 
                    className="inline-block"
                    style={{
                      background: 'linear-gradient(135deg, #FF3366 0%, #FFB800 50%, #00FF94 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    YOUR WORK
                  </span>
                </h1>
              </div>
              <div className="h-1 w-32 bg-gradient-to-r from-red-500 to-green-500" />
            </div>
          </div>

          {/* Opening Statement */}
          <div className="content-reveal mb-16" style={{ animationDelay: '0.2s' }}>
            <div className="quote-highlight text-white">
              Got something to say? We want to hear it.
            </div>
          </div>

          {/* Introduction */}
          <div className="content-reveal mb-20 text-lg text-gray-300 leading-relaxed" style={{ animationDelay: '0.3s' }}>
            <p>
              Deelaruze is built on community. We're always looking for fresh voices,
              raw talent, and artists who aren't afraid to push boundaries. If your
              work lives on walls, stickers, or anywhere the establishment didn't give
              you permission—we want to see it.
            </p>
          </div>

          {/* What We're Looking For */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-12 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              <h2 className="submit-title text-4xl md:text-5xl text-white">
                WHAT WE'RE LOOKING FOR
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {criteria.map((item, index) => (
                <div
                  key={index}
                  className="criteria-card content-reveal p-6 flex items-start gap-4"
                  style={{ 
                    color: item.color,
                    animationDelay: `${0.4 + index * 0.1}s` 
                  }}
                >
                  <item.icon className="icon-float w-8 h-8 flex-shrink-0" style={{ color: item.color }} />
                  <span className="text-gray-300 leading-relaxed">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Guidelines */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-12 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
              <h2 className="submit-title text-4xl md:text-5xl text-white">
                SUBMISSION GUIDELINES
              </h2>
            </div>

            <div className="space-y-4">
              {guidelines.map((guide, index) => (
                <div
                  key={index}
                  className="guideline-item content-reveal p-6 relative"
                  style={{ 
                    borderLeftColor: '#FF3366',
                    animationDelay: `${0.9 + index * 0.1}s` 
                  }}
                >
                  <div className="guideline-number">{guide.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {guide.label}
                  </h3>
                  <p className="text-gray-400">
                    {guide.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Form */}
          <div 
            className="content-reveal mb-20"
            style={{ animationDelay: '1.4s' }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-12 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
              <h2 className="submit-title text-4xl md:text-5xl text-white">
                SUBMIT NOW
              </h2>
            </div>
            <SubmissionForm />
          </div>

          {/* What Happens Next */}
          <div 
            className="info-box content-reveal p-10"
            style={{ animationDelay: '1.5s' }}
          >
            <div className="flex items-center gap-4 mb-8">
              <ArrowRight className="w-8 h-8 text-red-500" />
              <h3 className="submit-title text-3xl text-white">
                WHAT HAPPENS NEXT?
              </h3>
            </div>
            
            <div className="space-y-6">
              {processSteps.map((step, index) => (
                <div key={index} className="process-step text-gray-300 text-lg">
                  {step}
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-gray-400 text-sm">
                Questions about the submission process? Email us at{' '}
                <a href="mailto:submissions@deelaruze.com" className="text-red-500 hover:text-red-400 transition-colors">
                  submissions@deelaruze.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submit;