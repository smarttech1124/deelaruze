import React, { useState } from 'react';
import { Mail, Instagram, MessageCircle, Send, ChevronDown, ExternalLink } from 'lucide-react';
import ContactForm from '../components/forms/ContactForm';
import NewsletterForm from '../components/forms/NewsletterForm';

const Contact = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const contactMethods = [
    {
      icon: Mail,
      label: 'Email',
      value: 'contact@deelaruze.com',
      link: 'mailto:contact@deelaruze.com',
      color: '#FF3366'
    },
    {
      icon: Instagram,
      label: 'Instagram',
      value: '@deelaruze',
      link: 'https://instagram.com/deelaruze',
      color: '#E4405F',
      external: true
    },
  ];

  const infoBoxes = [
    {
      title: 'GENERAL INQUIRIES',
      description: 'For general questions, collaborations, or press inquiries, reach out via email or the contact form.',
      color: '#FF3366'
    },
    {
      title: 'ARTIST SUBMISSIONS',
      description: 'Want to submit your work? Use our dedicated submission page for faster review.',
      color: '#00FF94',
      cta: {
        text: 'SUBMIT YOUR ART',
        link: '/submit'
      }
    },
    {
      title: 'WHOLESALE INQUIRIES',
      description: 'Interested in stocking our publications? We offer wholesale pricing for retailers and galleries.',
      color: '#FFB800'
    }
  ];

  const faqs = [
    {
      question: 'How do I submit my artwork?',
      answer: 'Visit our Submit page and fill out the form with your details and portfolio samples. We review all submissions within 2-3 weeks.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes! We ship worldwide. Shipping costs are calculated at checkout based on your location.'
    },
    {
      question: 'Can I wholesale your publications?',
      answer: 'We offer wholesale pricing for retailers and galleries. Email us at wholesale@deelaruze.com for more information.'
    },
    {
      question: 'How do I collaborate with Deelaruze?',
      answer: 'We\'re always open to collaborations with artists, brands, and organizations that align with our values. Reach out via the contact form above.'
    },
    {
      question: 'What\'s your typical response time?',
      answer: 'We aim to respond to all inquiries within 48-72 hours during business days. Artist submissions may take 2-3 weeks for review.'
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
        className="fixed top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
        style={{ background: 'radial-gradient(circle, #FF3366 0%, transparent 70%)' }}
      />
      <div 
        className="fixed bottom-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
        style={{ background: 'radial-gradient(circle, #00FF94 0%, transparent 70%)' }}
      />

      <div className="contact-container relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="mb-20">
            {/* <div className="section-badge hero-fade">
              CONNECT
            </div> */}

            <div className="hero-fade mb-6" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-6 mb-4">
                <MessageCircle className="icon-float w-12 h-12 md:w-16 md:h-16 text-red-500" />
                <h1 className="contact-title text-6xl md:text-8xl text-white tracking-tight leading-none">
                  GET IN
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
                    TOUCH
                  </span>
                </h1>
              </div>
              {/* <div className="h-1 w-32 bg-gradient-to-r from-red-500 to-green-500" /> */}
            </div>

            <p 
              className="hero-fade text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed"
              style={{ animationDelay: '0.2s' }}
            >
              Have questions? Want to collaborate? We're here to listen.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                target={method.external ? '_blank' : undefined}
                rel={method.external ? 'noopener noreferrer' : undefined}
                className="contact-card content-reveal p-8 flex items-center gap-6 group"
                style={{ 
                  color: method.color,
                  animationDelay: `${0.3 + index * 0.1}s` 
                }}
              >
                <method.icon className="w-12 h-12 flex-shrink-0" style={{ color: method.color }} />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1 tracking-wider">
                    {method.label}
                  </div>
                  <div className="text-xl font-bold text-white group-hover:text-current transition-colors">
                    {method.value}
                  </div>
                </div>
                {method.external && (
                  <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-current transition-colors" />
                )}
              </a>
            ))}
          </div>

          {/* Info Boxes */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {infoBoxes.map((box, index) => (
              <div
                key={index}
                className="info-box content-reveal p-6"
                style={{ 
                  borderLeftColor: box.color,
                  animationDelay: `${0.5 + index * 0.1}s` 
                }}
              >
                <h3 className="font-bold text-white mb-3 tracking-wider text-sm">
                  {box.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {box.description}
                </p>
                {box.cta && (
                  <a
                    href={box.cta.link}
                    className="cta-button inline-flex items-center gap-2 px-4 py-2 border border-white text-sm font-bold hover:bg-white hover:text-black transition-colors"
                  >
                    {box.cta.text}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Newsletter */}
            <div 
              className="content-reveal"
              style={{ animationDelay: '0.8s' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <Send className="w-8 h-8 text-yellow-500" />
                <h2 className="contact-title text-3xl text-white">
                  NEWSLETTER
                </h2>
              </div>
              <NewsletterForm />
            </div>

            {/* Quick Stats or Additional Info */}
            <div 
              className="content-reveal"
              style={{ animationDelay: '0.9s' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <MessageCircle className="w-8 h-8 text-green-500" />
                <h2 className="contact-title text-3xl text-white">
                  RESPONSE TIME
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 border border-white/10">
                  <span className="text-gray-400">General Inquiries</span>
                  <span className="font-bold text-white">48-72h</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 border border-white/10">
                  <span className="text-gray-400">Artist Submissions</span>
                  <span className="font-bold text-white">2-3 weeks</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 border border-white/10">
                  <span className="text-gray-400">Wholesale Inquiries</span>
                  <span className="font-bold text-white">3-5 days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div 
            className="content-reveal mb-20"
            style={{ animationDelay: '1.0s' }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-12 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              <h2 className="contact-title text-4xl md:text-5xl text-white">
                SEND A MESSAGE
              </h2>
            </div>
            <ContactForm />
          </div>

          {/* FAQ Section */}
          <div 
            className="content-reveal"
            style={{ animationDelay: '1.1s' }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-12 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
              <h2 className="contact-title text-4xl md:text-5xl text-white">
                FAQ
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`faq-item p-6 ${expandedFaq === index ? 'expanded' : ''}`}
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <div className="flex justify-between items-center cursor-pointer">
                    <h3 className="font-bold text-white pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown 
                      className={`chevron-rotate w-5 h-5 text-gray-500 flex-shrink-0 ${
                        expandedFaq === index ? 'expanded' : ''
                      }`}
                    />
                  </div>
                  <div className={`faq-answer ${expandedFaq === index ? 'expanded' : ''}`}>
                    <p className="text-gray-400 mt-4 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;