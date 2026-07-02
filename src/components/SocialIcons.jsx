import React from 'react';

// ── Hand-built social icons, drawn in Lucide's own stroke style ────────────────
// (24x24 viewBox, currentColor stroke, round caps/joins) so they sit flush
// next to any other lucide-react icons already in the app.
// Each accepts the same props lucide icons do — pass className for sizing/color.

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function FacebookIcon({ className, ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M15 4h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h2.5l.5-4H13V8a1 1 0 0 1 1-1h2z" />
    </svg>
  );
}

export function InstagramIcon({ className, ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function XIcon({ className, ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

export function YoutubeIcon({ className, ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.5v5l5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TiktokIcon({ className, ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M14 3v10.5a3.5 3.5 0 1 1-3-3.46" />
      <path d="M14 3c.5 2.5 2.2 4.2 4.5 4.5" />
    </svg>
  );
}
