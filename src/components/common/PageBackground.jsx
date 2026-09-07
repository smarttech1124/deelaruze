import React from 'react';

/**
 * The grid + grain + gradient wash used across the public pages.
 * Purely decorative, so it is hidden from assistive technology.
 */
const PageBackground = ({
  topAccent = '#FF3366',
  bottomAccent = '#00FF94',
  topPosition = 'top-0 right-0',
  bottomPosition = 'bottom-0 left-0',
}) => (
  <div aria-hidden="true">
    <div className="fixed inset-0 grid-bg" />

    <div
      className="fixed inset-0 opacity-3"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />

    <div
      className={`fixed ${topPosition} w-[500px] h-[500px] rounded-full blur-3xl opacity-10`}
      style={{ background: `radial-gradient(circle, ${topAccent} 0%, transparent 70%)` }}
    />
    <div
      className={`fixed ${bottomPosition} w-[500px] h-[500px] rounded-full blur-3xl opacity-10`}
      style={{ background: `radial-gradient(circle, ${bottomAccent} 0%, transparent 70%)` }}
    />
  </div>
);

export default PageBackground;
