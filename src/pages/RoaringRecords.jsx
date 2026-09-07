import React, { useEffect, useState } from 'react';
import { Disc3, Play, ArrowUpRight, X } from 'lucide-react';
import { roaringRecordService } from '../services/contentService';
import { usePageContent } from '../hooks/usePageContent';
import { resolveMedia, defaultMediaLabel } from '../utils/media';
import PageBackground from '../components/common/PageBackground';
import Loader from '../components/common/Loader';

const DEFAULTS = {
  title: 'ROARING RECORDS',
  subtitle: 'Sound from the underground. Pressed, played, preserved.',
  description: '',
};

/**
 * Optional Watch/Listen button. Embeddable links (YouTube, Vimeo, Spotify,
 * SoundCloud) and direct audio/video files play inline on the page; anything
 * else falls back to opening in a new tab.
 */
const MediaPlayer = ({ record }) => {
  const [open, setOpen] = useState(false);

  const media = resolveMedia(record.mediaUrl);
  if (!media) return null;

  const label = (record.mediaLabel || '').trim() || defaultMediaLabel(media);

  // Nothing embeddable — just send the visitor to the source.
  if (media.kind === 'link') {
    return (
      <a
        href={media.src}
        target="_blank"
        rel="noopener noreferrer"
        className="media-button inline-flex items-center gap-3 mt-8 px-6 py-3 border border-white/30 text-white font-bold tracking-wider transition-colors hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        {label}
        <ArrowUpRight size={18} aria-hidden="true" />
      </a>
    );
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="media-button inline-flex items-center gap-3 px-6 py-3 border border-white/30 text-white font-bold tracking-wider transition-colors hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        {open ? <X size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
        {open ? 'CLOSE' : label}
      </button>

      {open && (
        <div className="mt-6">
          {media.kind === 'iframe' && (
            // Audio embeds have a fixed player height; video embeds are 16:9.
            <div
              className={`w-full overflow-hidden bg-black border border-white/10 ${
                media.compact ? 'h-[166px]' : 'aspect-video'
              }`}
            >
              <iframe
                src={media.src}
                title={`${record.title} player`}
                className="w-full h-full block"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}

          {media.kind === 'audio' && (
            <audio src={media.src} controls preload="none" className="w-full">
              Your browser does not support the audio element.
            </audio>
          )}

          {media.kind === 'video' && (
            <video
              src={media.src}
              controls
              preload="none"
              className="w-full border border-white/10"
            >
              Your browser does not support the video element.
            </video>
          )}
        </div>
      )}
    </div>
  );
};

const RoaringRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { content } = usePageContent('roaring-records', DEFAULTS);

  useEffect(() => {
    let mounted = true;

    const loadRecords = async () => {
      try {
        const response = await roaringRecordService.getAll();
        if (mounted) setRecords(response.data || []);
      } catch (error) {
        console.error('Error loading roaring records:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadRecords();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <PageBackground topAccent="#FF3366" bottomAccent="#FFB800" />

      <div className="relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">

          {/* ── Page header ─────────────────────────────────────────────── */}
          <header className="mb-16 md:mb-24">
            <div className="hero-fade mb-6" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-4 sm:gap-6 mb-4">
                <Disc3
                  className="icon-float w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-red-500 flex-shrink-0"
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

          {/* ── Records ─────────────────────────────────────────────────── */}
          {loading ? (
            <Loader size="lg" />
          ) : records.length === 0 ? (
            <div className="text-center py-20 border border-white/10 bg-white/[0.02]">
              <Disc3
                className="w-10 h-10 mx-auto mb-4 text-gray-700"
                aria-hidden="true"
              />
              <p className="text-xl sm:text-2xl text-gray-400">
                No records published yet
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Check back soon — new pressings are on the way.
              </p>
            </div>
          ) : (
            <div className="space-y-16 md:space-y-28">
              {records.map((record, index) => {
                // Rows alternate image / text on tablet and up; mobile always
                // stacks the artwork first so the rhythm still reads top-down.
                const imageFirst = index % 2 === 0;

                // Keep the frame hugging the edge its column sits on, rather
                // than floating centred within the wide 2-col row.
                const artworkAlign = imageFirst ? 'md:mr-auto' : 'md:ml-auto';

                return (
                  <article
                    key={record._id}
                    className="record-row grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center content-reveal"
                    style={{ animationDelay: `${Math.min(index, 6) * 0.1}s` }}
                    aria-labelledby={`record-title-${record._id}`}
                  >
                    {/* Artwork — same sized tile and bordered frame as the
                        Stickers page gallery, so artwork reads consistently
                        across both pages. */}
                    <div
                      className={`record-artwork group relative w-full max-w-[200px] sm:max-w-[240px] md:max-w-[220px] lg:max-w-[260px] xl:max-w-[300px] aspect-square mx-auto ${artworkAlign} bg-white/[0.03] border border-white/10 overflow-hidden transition-colors duration-300 hover:border-white/40 ${
                        imageFirst ? 'md:order-1' : 'md:order-2'
                      }`}
                    >
                      {record.image?.url ? (
                        <img
                          src={record.image.url}
                          alt={record.image.alt || `${record.title} artwork`}
                          loading="lazy"
                          decoding="async"
                          // contain keeps mixed artwork ratios from cropping badly
                          className="w-full h-full object-contain p-3 sm:p-4 transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                          <Disc3 className="w-12 h-12" aria-hidden="true" />
                        </div>
                      )}
                    </div>

                    {/* Copy */}
                    <div
                      className={`${imageFirst ? 'md:order-2' : 'md:order-1'}`}
                    >
                      <div
                        className="h-1 w-16 mb-6"
                        style={{
                          background:
                            'linear-gradient(90deg, #FF3366 0%, transparent 100%)',
                        }}
                        aria-hidden="true"
                      />

                      <h2
                        id={`record-title-${record._id}`}
                        className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-3"
                      >
                        {record.title}
                      </h2>

                      {record.subtitle && (
                        <p className="text-base sm:text-lg text-red-500 tracking-wide mb-6">
                          {record.subtitle}
                        </p>
                      )}

                      {record.description && (
                        <p className="text-sm sm:text-base text-gray-400 leading-relaxed whitespace-pre-line">
                          {record.description}
                        </p>
                      )}

                      <MediaPlayer record={record} />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoaringRecords;
