// Works out how a supplied media link should be played on the page.
//
// Returns { kind, src }:
//   'iframe' → embeddable player (YouTube, Vimeo, Spotify, SoundCloud)
//   'audio'  → direct audio file, played with a native <audio> element
//   'video'  → direct video file, played with a native <video> element
//   'link'   → nothing embeddable, so the button opens the URL in a new tab

const AUDIO_EXTENSIONS = /\.(mp3|wav|ogg|oga|m4a|aac|flac)(\?.*)?$/i;
const VIDEO_EXTENSIONS = /\.(mp4|webm|ogv|mov|m4v)(\?.*)?$/i;

export const resolveMedia = (rawUrl) => {
  const url = (rawUrl || '').trim();
  if (!url) return null;

  let parsed;
  try {
    parsed = new URL(url);
  } catch (error) {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, '');

  // ── YouTube ───────────────────────────────────────────────────────────────
  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1);
    if (id) return { kind: 'iframe', src: `https://www.youtube.com/embed/${id}` };
  }

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
    const id = parsed.searchParams.get('v');
    if (id) return { kind: 'iframe', src: `https://www.youtube.com/embed/${id}` };

    // Already an /embed/ or /shorts/ link
    const match = parsed.pathname.match(/^\/(embed|shorts)\/([\w-]+)/);
    if (match) return { kind: 'iframe', src: `https://www.youtube.com/embed/${match[2]}` };
  }

  // ── Vimeo ─────────────────────────────────────────────────────────────────
  if (host === 'vimeo.com') {
    const id = parsed.pathname.split('/').filter(Boolean)[0];
    if (/^\d+$/.test(id)) {
      return { kind: 'iframe', src: `https://player.vimeo.com/video/${id}` };
    }
  }

  // ── Spotify ───────────────────────────────────────────────────────────────
  if (host === 'open.spotify.com') {
    const parts = parsed.pathname.split('/').filter(Boolean);
    // Skip a locale prefix such as /intl-de/track/<id>
    const typeIndex = parts.findIndex((part) =>
      ['track', 'album', 'playlist', 'episode', 'show', 'artist'].includes(part)
    );

    if (typeIndex !== -1 && parts[typeIndex + 1]) {
      return {
        kind: 'iframe',
        src: `https://open.spotify.com/embed/${parts[typeIndex]}/${parts[typeIndex + 1]}`,
        compact: true,
      };
    }
  }

  // ── SoundCloud ───────────────────────────────────────────────────────────
  if (host === 'soundcloud.com' || host.endsWith('.soundcloud.com')) {
    return {
      kind: 'iframe',
      src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff3366`,
      compact: true,
    };
  }

  // ── Direct media files ───────────────────────────────────────────────────
  if (AUDIO_EXTENSIONS.test(parsed.pathname)) return { kind: 'audio', src: url };
  if (VIDEO_EXTENSIONS.test(parsed.pathname)) return { kind: 'video', src: url };

  return { kind: 'link', src: url };
};

// Sensible default button text based on what the link turns out to be.
export const defaultMediaLabel = (media) => {
  if (!media) return 'LISTEN NOW';
  if (media.kind === 'video') return 'WATCH NOW';
  if (media.kind === 'iframe' && /youtube|vimeo/.test(media.src)) return 'WATCH NOW';
  return 'LISTEN NOW';
};

export default resolveMedia;
