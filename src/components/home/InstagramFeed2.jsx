/**
 * InstagramFeed.jsx
 *
 * Displays an Instagram page's profile stats and 8 most recent posts.
 * Uses the Instagram Graph API via instagramService.js
 *
 * Usage:
 *   import InstagramFeed from './components/InstagramFeed';
 *   <InstagramFeed />
 *
 * Make sure your .env has:
 *   REACT_APP_INSTAGRAM_USER_ID=...
 *   REACT_APP_INSTAGRAM_ACCESS_TOKEN=...
 */

import { useEffect, useState, useCallback } from 'react';
import { fetchProfile, fetchRecentPosts } from '../services/instagramService';

// ─── Icons ────────────────────────────────────────────────────────────────────

const HeartIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CommentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const VideoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const CarouselIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const InstagramLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15,3 21,3 21,9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCount = (n) => {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-zinc-800 rounded ${className}`} />
);

const FeedSkeleton = () => (
  <div className="min-h-screen bg-[#0a0a0a] text-white px-4 py-12 font-sans">
    <div className="max-w-3xl mx-auto">
      {/* Profile skeleton */}
      <div className="flex items-center gap-6 mb-10">
        <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-64" />
          <div className="flex gap-6 pt-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-[2px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-none" />
        ))}
      </div>
    </div>
  </div>
);

// ─── Post Card ────────────────────────────────────────────────────────────────

const PostCard = ({ post, onClick, index }) => {
  const thumb = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;

  return (
    <button
      onClick={() => onClick(post)}
      className="relative group aspect-square overflow-hidden bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      style={{ animationDelay: `${index * 60}ms` }}
      aria-label={`View post from ${timeAgo(post.timestamp)}`}
    >
      {thumb ? (
        <img
          src={thumb}
          alt={post.caption?.slice(0, 60) || 'Instagram post'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
          No preview
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3 p-2">
        <div className="flex gap-4 text-white text-sm font-semibold">
          <span className="flex items-center gap-1.5">
            <HeartIcon filled />
            {formatCount(post.like_count)}
          </span>
          <span className="flex items-center gap-1.5">
            <CommentIcon />
            {formatCount(post.comments_count)}
          </span>
        </div>
        {post.caption && (
          <p className="text-white/70 text-[10px] text-center line-clamp-2 px-2 leading-relaxed">
            {post.caption}
          </p>
        )}
      </div>

      {/* Media type badge */}
      {(post.media_type === 'VIDEO' || post.media_type === 'CAROUSEL_ALBUM') && (
        <span className="absolute top-2 right-2 text-white drop-shadow-lg">
          {post.media_type === 'VIDEO' ? <VideoIcon /> : <CarouselIcon />}
        </span>
      )}
    </button>
  );
};

// ─── Post Modal ───────────────────────────────────────────────────────────────

const PostModal = ({ post, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const media = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#111] border border-zinc-800 rounded-xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col sm:flex-row"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="sm:w-1/2 aspect-square bg-black flex-shrink-0">
          {media && (
            <img src={media} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span className="text-xs text-zinc-400 tracking-widest uppercase font-mono">
              {timeAgo(post.timestamp)}
            </span>
            <div className="flex items-center gap-3">
              <a
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition flex items-center gap-1 text-xs"
                aria-label="Open on Instagram"
              >
                View on Instagram <ExternalLinkIcon />
              </a>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-white transition text-lg leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Caption */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
              {post.caption || <span className="text-zinc-600 italic">No caption</span>}
            </p>
          </div>

          {/* Stats */}
          <div className="border-t border-zinc-800 px-4 py-3 flex gap-5 text-sm">
            <span className="flex items-center gap-2 text-zinc-300">
              <HeartIcon filled /> {formatCount(post.like_count)} likes
            </span>
            <span className="flex items-center gap-2 text-zinc-300">
              <CommentIcon /> {formatCount(post.comments_count)} comments
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const InstagramFeed = () => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileData, postsData] = await Promise.all([
        fetchProfile(),
        fetchRecentPosts(8),
      ]);
      setProfile(profileData);
      setPosts(postsData);
    } catch (err) {
      console.error('[InstagramFeed]', err);
      setError(err.message || 'Failed to load Instagram data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <FeedSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-zinc-600 text-5xl mb-2">⚠</div>
          <p className="text-white font-semibold text-lg">Could not load feed</p>
          <p className="text-zinc-400 text-sm leading-relaxed">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-6 py-2.5 bg-white text-black text-sm font-bold rounded hover:opacity-80 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Post detail modal */}
      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      <div className="min-h-screen bg-[#0a0a0a] text-white px-4 py-12">
        <div className="max-w-3xl mx-auto">

          {/* ── Profile Header ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 pb-10 border-b border-zinc-800/60">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-zinc-700">
                {profile?.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                    <InstagramLogo />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                <h1 className="text-xl font-bold tracking-tight truncate">
                  @{profile?.username}
                </h1>
                <a
                  href={`https://www.instagram.com/${profile?.username}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-500 hover:text-white text-xs transition"
                  aria-label="Open Instagram profile"
                >
                  <InstagramLogo />
                </a>
              </div>

              {profile?.biography && (
                <p className="text-zinc-400 text-sm leading-relaxed mt-1 mb-3 max-w-md line-clamp-3">
                  {profile.biography}
                </p>
              )}

              {profile?.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs transition flex items-center gap-1 mb-3"
                >
                  {profile.website.replace(/^https?:\/\//, '')} <ExternalLinkIcon />
                </a>
              )}

              {/* Stats row */}
              <div className="flex gap-6 mt-2">
                {[
                  { label: 'Posts', value: formatCount(profile?.media_count) },
                  { label: 'Followers', value: formatCount(profile?.followers_count) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col items-center sm:flex-row sm:gap-1.5">
                    <span className="text-white font-bold text-base leading-none">{value}</span>
                    <span className="text-zinc-500 text-xs uppercase tracking-wider mt-0.5 sm:mt-0">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Recent Posts label ── */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-mono">
              Recent posts
            </p>
            <span className="text-xs text-zinc-600 font-mono">
              {posts.length} shown
            </span>
          </div>

          {/* ── Posts Grid ── */}
          {posts.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-16">No posts to display.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-[2px]">
              {posts.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={i}
                  onClick={setSelectedPost}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default InstagramFeed;