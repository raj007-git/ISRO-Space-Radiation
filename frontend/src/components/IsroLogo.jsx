import React from 'react';

/**
 * Official Indian Space Research Organisation (ISRO) Emblem & Wordmark SVG
 */
export default function IsroLogo({ className = "h-9" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official ISRO Emblem (Orange Delta + Blue Satellite Rays) */}
      <svg className="h-full w-auto" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Blue Solar Panels / Satellite Dish Rays */}
        <path d="M 68 18 L 84 10 L 88 18 L 72 26 Z" fill="#0284C7" />
        <path d="M 74 32 L 92 28 L 94 36 L 76 40 Z" fill="#0284C7" />
        <path d="M 76 46 L 96 46 L 96 54 L 76 54 Z" fill="#0284C7" />
        <path d="M 74 60 L 92 64 L 94 72 L 72 68 Z" fill="#0284C7" />
        <path d="M 66 74 L 84 82 L 86 90 L 68 82 Z" fill="#0284C7" />

        {/* Central Satellite Core Dot */}
        <circle cx="68" cy="50" r="4.5" fill="#0284C7" />

        {/* Upward Orange Rocket Wing / Delta Arrowhead */}
        <path 
          d="M 12 85 L 56 6 L 64 24 L 38 78 L 62 78 L 64 85 Z" 
          fill="#F97316" 
        />
        {/* Horizontal cutouts inside the orange delta */}
        <path d="M 28 58 L 52 58 L 50 63 L 26 63 Z" fill="#04060A" opacity="0.4" />
        <path d="M 33 46 L 55 46 L 53 51 L 31 51 Z" fill="#04060A" opacity="0.4" />
        <path d="M 38 34 L 58 34 L 56 39 L 36 39 Z" fill="#04060A" opacity="0.4" />
      </svg>

      {/* Official ISRO Bilingual Wordmark */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-extrabold text-lg md:text-xl tracking-[0.15em] text-cream">
            ISRO
          </span>
          <span className="font-sans text-xs font-semibold text-orange tracking-widest">
            इसरो
          </span>
        </div>
        <span className="font-mono text-[9px] text-muted tracking-wider uppercase mt-0.5">
          Space Radiation Forecast
        </span>
      </div>
    </div>
  );
}
