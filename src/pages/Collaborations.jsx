import React, { useEffect, useState } from 'react';
import { Users, ArrowUpRight } from 'lucide-react';
import { collaborationService } from '../services/contentService';
import { usePageContent } from '../hooks/usePageContent';
import PageBackground from '../components/common/PageBackground';
import Loader from '../components/common/Loader';

const DEFAULTS = {
  title: 'COLLABORATIONS',
  subtitle: 'Work made with the artists, brands and crews we run with.',
  description: '',
};

// A card is a link when the admin supplied one, a plain figure otherwise.
const CollaborationCard = ({ collaboration: item, index }) => {
  const hasLink = Boolean(item.link);
  const Wrapper = hasLink ? 'a' : 'div';

  const wrapperProps = hasLink
    ? {
        href: item.link,
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': `${item.collaborator} — open collaboration link`,
      }
    : {};

  return (
    <article
      className="content-reveal"
      style={{ animationDelay: `${Math.min(index, 9) * 0.08}s` }}
    >
      <Wrapper
        {...wrapperProps}
        className={`collab-card group block relative bg-white/[0.02] border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/40 hover:-translate-y-1 ${
          hasLink
            ? 'focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black'
            : ''
        }`}
      >
        {/* Fixed 4:5 frame keeps mixed artwork ratios aligned across the grid */}
        <div className="relative w-full aspect-[4/5] bg-gray-900 overflow-hidden">
          {item.image?.url ? (
            <img
              src={item.image.url}
              alt={item.image.alt || `Collaboration with ${item.collaborator}`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-700">
              <Users className="w-10 h-10" aria-hidden="true" />
            </div>
          )}

          <div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95"
            aria-hidden="true"
          />

          {hasLink && (
            <span
              className="absolute top-4 right-4 p-2 bg-black/60 border border-white/20 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
              aria-hidden="true"
            >
              <ArrowUpRight size={16} />
            </span>
          )}
        </div>

        {/* Collaborator name */}
        <div className="p-5 sm:p-6">
          <div
            className="h-1 w-10 mb-4 transition-all duration-300 group-hover:w-20"
            style={{
              background: 'linear-gradient(90deg, #00FF94 0%, transparent 100%)',
            }}
            aria-hidden="true"
          />

          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight break-words">
            {item.collaborator}
          </h2>

          {item.title && (
            <p className="text-sm text-green-400 tracking-wide mt-2">
              {item.title}
            </p>
          )}

          {item.description && (
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mt-3 line-clamp-3">
              {item.description}
            </p>
          )}
        </div>
      </Wrapper>
    </article>
  );
};

const Collaborations = () => {
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { content } = usePageContent('collaborations', DEFAULTS);

  useEffect(() => {
    let mounted = true;

    const loadCollaborations = async () => {
      try {
        const response = await collaborationService.getAll();
        if (mounted) setCollaborations(response.data || []);
      } catch (error) {
        console.error('Error loading collaborations:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCollaborations();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <PageBackground
        topAccent="#00FF94"
        bottomAccent="#FF3366"
        topPosition="top-0 right-1/4"
        bottomPosition="bottom-0 left-1/4"
      />

      <div className="relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">

          {/* ── Page header ─────────────────────────────────────────────── */}
          <header className="mb-12 md:mb-16">
            <div className="hero-fade mb-6" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-4 sm:gap-6 mb-4">
                <Users
                  className="icon-float w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-green-400 flex-shrink-0"
                  aria-hidden="true"
                />
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
                  {content.title}
                </h1>
              </div>
            </div>

            {content.subtitle && (
              <p
                className="hero-fade text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed"
                style={{ animationDelay: '0.2s' }}
              >
                {content.subtitle}
              </p>
            )}

            {content.description && (
              <div
                className="hero-fade prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-300 break-words mt-8"
                style={{ animationDelay: '0.3s' }}
                dangerouslySetInnerHTML={{ __html: content.description }}
              />
            )}
          </header>

          {/* ── Grid ────────────────────────────────────────────────────── */}
          {loading ? (
            <Loader size="lg" />
          ) : collaborations.length === 0 ? (
            <div className="text-center py-20 border border-white/10 bg-white/[0.02]">
              <Users
                className="w-10 h-10 mx-auto mb-4 text-gray-700"
                aria-hidden="true"
              />
              <p className="text-xl sm:text-2xl text-gray-400">
                No collaborations published yet
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Want to work together? Get in touch.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {collaborations.map((item, index) => (
                <CollaborationCard key={item._id} collaboration={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collaborations;
