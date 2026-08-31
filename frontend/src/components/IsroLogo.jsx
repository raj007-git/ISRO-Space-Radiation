import React from 'react';
import isroLogo from '../assets/isro_logo.svg';

/**
 * Official Indian Space Research Organisation (ISRO) Emblem & Wordmark
 */
export default function IsroLogo({ className = "h-10" }) {
  return (
    <div className="flex items-center gap-3">
      <img 
        src={isroLogo} 
        alt="ISRO Logo" 
        className={`${className} w-auto object-contain drop-shadow-[0_2px_12px_rgba(244,114,22,0.25)]`} 
      />
      <div className="hidden sm:flex flex-col justify-center leading-none border-l border-white/10 pl-3">
        <span className="font-display font-bold text-sm tracking-widest text-cream uppercase">
          Space Radiation Forecast
        </span>
        <span className="font-mono text-[9px] text-muted tracking-wider uppercase mt-0.5">
          Mission Operations Complex
        </span>
      </div>
    </div>
  );
}
