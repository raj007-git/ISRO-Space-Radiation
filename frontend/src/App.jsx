import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ForecastAnalytics from './pages/ForecastAnalytics';
import AlertCenter from './pages/AlertCenter';
import AboutProject from './pages/AboutProject';
import spaceBg from './assets/space_bg.jpg';
import { Activity, ShieldCheck, Radio, Globe, Satellite, AlertTriangle, Layers, Info } from 'lucide-react';

/* ── Translucent Space Telemetry Ticker Ribbon ── */
function SpaceTicker() {
  const [items, setItems] = useState([
    'NOAA UPLINK NOMINAL',
    'GOES-16 SEISS CONNECTED',
    'WIND L1 TELEMETRY ACTIVE',
    'SOLAR WIND: 412 km/s',
    'PROTON DENSITY: 6.8 particles / cm³',
    'IMF Bz: -2.40 nT',
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/v1/current-space-weather');
        if (r.ok) {
          const d = await r.json();
          setItems([
            'NOAA SWPC UPLINK ACTIVE',
            `GOES-16 FLUX (≥2MeV): ${d.Electron_Flux != null ? d.Electron_Flux.toFixed(1) : '151.2'} electrons / cm² / s`,
            `SOLAR WIND SPEED: ${d.Solar_Wind_Speed != null ? d.Solar_Wind_Speed.toFixed(0) : '417'} km/s`,
            `PROTON DENSITY: ${d.Solar_Wind_Density != null ? d.Solar_Wind_Density.toFixed(1) : '7.4'} particles / cm³`,
            `IMF Bz (GSM): ${d.Bz != null ? d.Bz.toFixed(2) : '-3.11'} nT`,
            'WIND SWE/MFI STREAM OK',
            'AUTONOMOUS MITIGATION READY',
          ]);
        }
      } catch {}
    };
    load();
    const iv = setInterval(load, 45000);
    return () => clearInterval(iv);
  }, []);

  const str = items.map(i => `✦  ${i}`).join('     ');
  return (
    <div className="backdrop-blur-xl bg-[#06080E]/80 border-b border-white/[0.06] h-8 flex items-center shrink-0 overflow-hidden relative z-40">
      <div className="flex items-center px-4 bg-cyanAccent/10 border-r border-cyanAccent/20 h-full shrink-0 gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyanAccent animate-pulse"></span>
        <span className="font-mono text-[10px] font-bold text-cyanAccent tracking-widest uppercase">LIVE TELEMETRY</span>
      </div>
      <div className="ticker-inner whitespace-nowrap font-mono text-[11px] text-cream/70 tracking-wider">
        {str}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{str}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{str}
      </div>
    </div>
  );
}

/* ── Futuristic HUD Top Navigation (Directly modeled on NASA reference design) ── */
const NAV = [
  { to: '/',          label: 'Dashboard',        icon: Globe },
  { to: '/analytics', label: 'Workstation',      icon: Activity },
  { to: '/alerts',    label: 'Alert Console',    icon: AlertTriangle },
  { to: '/about',     label: 'Mission Briefing', icon: Info },
];

function TopNav() {
  const loc = useLocation();
  const [utc, setUtc] = useState('');

  useEffect(() => {
    const t = () => setUtc(new Date().toISOString().slice(11, 19));
    t();
    const iv = setInterval(t, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <header className="px-6 pt-4 pb-2 shrink-0 relative z-30">
      <div className="max-w-[1600px] mx-auto backdrop-blur-2xl bg-[#090D16]/75 border border-white/[0.08] rounded-full px-6 py-2.5 flex items-center justify-between shadow-glass">
        
        {/* Brand / Mission Control Logo */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange/30 via-cyanAccent/20 to-transparent border border-white/20 flex items-center justify-center shadow-cyan-glow relative overflow-hidden">
            <Satellite className="w-4 h-4 text-cyanAccent animate-pulse" />
            <div className="absolute inset-0 border border-cyanAccent/40 rounded-full animate-ping opacity-25 pointer-events-none"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xl tracking-[0.2em] text-cream">
                ISR<span className="text-orange">O</span>
              </span>
              <span className="bg-cyanAccent/10 border border-cyanAccent/30 text-cyanAccent text-[9px] font-mono px-2 py-0.5 rounded-full font-bold tracking-widest">
                MOC-4
              </span>
            </div>
            <div className="font-mono text-[9px] text-muted tracking-widest uppercase">
              Radiation Forecasting System
            </div>
          </div>
        </div>

        {/* Center Pill Navigation */}
        <nav className="flex items-center bg-black/40 p-1 rounded-full border border-white/[0.06]">
          {NAV.map(n => {
            const act = loc.pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-sans text-xs font-semibold tracking-wide transition-all duration-300 relative
                  ${act
                    ? 'bg-gradient-to-r from-cyanAccent/20 to-cyanAccent/10 text-cyanAccent border border-cyanAccent/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : 'text-muted hover:text-cream hover:bg-white/[0.04]'
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 ${act ? 'text-cyanAccent' : 'text-muted'}`} />
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Status & UTC Telemetry */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-igreen/10 border border-igreen/30 px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-igreen animate-pulse"></span>
            <span className="font-mono text-[10px] font-bold text-igreen tracking-wider uppercase">GLOBAL: NOMINAL</span>
          </div>

          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] px-4 py-1.5 rounded-full font-mono text-xs text-cream/90">
            <Radio className="w-3.5 h-3.5 text-cyanAccent animate-pulse" />
            <span className="text-muted text-[10px]">UTC</span>
            <span className="font-semibold text-cyanAccent">{utc}</span>
          </div>
        </div>

      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#05070C] text-cream overflow-x-hidden selection:bg-cyanAccent selection:text-black">
      
      {/* 3D Deep Space Background Layer */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${spaceBg})`,
          filter: 'contrast(115%) brightness(85%)',
        }}
      />

      {/* Futuristic Grid Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glowing Heliophysics Ambient Light */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-orange/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-40 w-[500px] h-[500px] bg-cyanAccent/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Main App Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <SpaceTicker />
        <TopNav />
        <main className="flex-1 pb-16 px-4 md:px-8">
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/analytics" element={<ForecastAnalytics />} />
            <Route path="/alerts"    element={<AlertCenter />} />
            <Route path="/about"     element={<AboutProject />} />
          </Routes>
        </main>
      </div>

    </div>
  );
}
