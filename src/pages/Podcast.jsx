import React from 'react';
import { Mic, ArrowUpRight } from 'lucide-react';
import PageBackground from '../components/common/PageBackground';

// Single featured episode for now. Kept as a config object so another episode
// (or a move to the CMS) is a small, obvious change rather than a rewrite.
const EPISODE = {
  show: 'VISUAL NOISE: WALLS TALK',
  cover: '/images/podcast-visual-noise-walls-talk.jpg',
  coverAlt: 'Visual Noise: Walls Talk — Episode 20 featuring Deelaruze',
  spotifyUrl: 'https://open.spotify.com/episode/1wtzc9Ekv9wjBzlq4zhmnG',
  spotifyEmbed:
    'https://open.spotify.com/embed/episode/1wtzc9Ekv9wjBzlq4zhmnG?utm_source=generator',
  intro:
    'Hosted by Canadian street artists TRP613 and Urban Ninja, this podcast dives deep into the world of street art, graffiti culture, murals, stickers, underground creativity, and the artists leaving their mark on the city.',
  paragraphs: [
    'From back alleys to massive walls, episodes uncover the stories, struggles, techniques, and inspirations behind the art most people walk past — but never really see.',
    'This isn’t just about art — it’s about expression, rebellion, community, survival, and turning blank walls into loud statements.',
    'Deelaruze also created work around the iconic history of stickers and street art. One of her projects, “Emergency on Planet Earth,” was connected to a PEEL magazine tribute to Shepard Fairey’s famous early sticker work.',
    'This episode is especially cool because Deelaruze isn’t just making street art — she’s helping preserve the history and stories of the people making it.',
  ],
};

const Podcast = () => {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <PageBackground
        topAccent="#A855F7"
        bottomAccent="#FF3366"
        topPosition="top-0 left-1/4"
        bottomPosition="bottom-0 right-1/4"
      />

      <div className="relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">

          {/* ── Page header ─────────────────────────────────────────────── */}
          <header className="mb-12 md:mb-16">
            <div className="hero-fade mb-6" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-4 sm:gap-6 mb-4">
                <Mic
                  className="icon-float w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-purple-400 flex-shrink-0"
                  aria-hidden="true"
                />
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
                  PODCAST
                </h1>
              </div>
            </div>

            <p
              className="hero-fade text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed"
              style={{ animationDelay: '0.2s' }}
            >
              Conversations from the wall up. The culture, in its own words.
            </p>
          </header>

          {/* ── Featured episode ────────────────────────────────────────── */}
          <section
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start content-reveal"
            aria-labelledby="podcast-episode-title"
          >
            {/* Media (the "pic" side): episode cover + playable Spotify embed */}
            <div className="lg:sticky lg:top-28 space-y-5">
              <div className="relative overflow-hidden bg-white/[0.03] border border-white/10 transition-colors duration-300 hover:border-white/40">
                <img
                  src={EPISODE.cover}
                  alt={EPISODE.coverAlt}
                  loading="eager"
                  decoding="async"
                  className="w-full h-auto block"
                />
              </div>

              <div className="relative bg-white/[0.03] border border-white/10 p-3 sm:p-4 transition-colors duration-300 hover:border-white/40">
                <iframe
                  title={`${EPISODE.show} — Spotify player`}
                  src={EPISODE.spotifyEmbed}
                  className="w-full block rounded"
                  height="232"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Copy */}
            <div>
              <div
                className="h-1 w-16 mb-6"
                style={{
                  background: 'linear-gradient(90deg, #A855F7 0%, transparent 100%)',
                }}
                aria-hidden="true"
              />

              <h2
                id="podcast-episode-title"
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-5"
              >
                {EPISODE.show}
              </h2>

              <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-5">
                {EPISODE.intro}
              </p>

              {EPISODE.paragraphs.map((text, i) => (
                <p
                  key={i}
                  className="text-sm sm:text-base text-gray-400 leading-relaxed mb-4"
                >
                  {text}
                </p>
              ))}

              <a
                href={EPISODE.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 mt-4 px-6 py-3 border border-white/30 text-white font-bold tracking-wider transition-colors hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                LISTEN ON SPOTIFY
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Podcast;
