import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ForecastAnalytics from './pages/ForecastAnalytics';
import AlertCenter from './pages/AlertCenter';
import AboutProject from './pages/AboutProject';

/* ── Orange scrolling ticker (matches design ref) ── */
function OrangeTicker() {
  const [items, setItems] = useState([
    'NOAA UPLINK ACTIVE', 'GOES-16 CONNECTED', 'WIND TELEMETRY OK',
    'SOLAR WIND -- km/s', 'DENSITY -- particles / cm³', 'IMF Bz -- nT',
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('https://isro-space-radiation.onrender.com/api/v1/current-space-weather')
        const d = await r.json();
        setItems([
          'NOAA UPLINK ACTIVE',
          `GOES-16 FLUX (≥2MeV): ${d.Electron_Flux != null ? d.Electron_Flux.toFixed(1) : '--'} electrons / cm² / s`,
          `WIND: ${d.Solar_Wind_Speed != null ? d.Solar_Wind_Speed.toFixed(0) : '--'} km/s`,
          `DENSITY: ${d.Solar_Wind_Density != null ? d.Solar_Wind_Density.toFixed(1) : '--'} particles / cm³`,
          `IMF Bz (GSM): ${d.Bz != null ? d.Bz.toFixed(2) : '--'} nT`,
          'WIND DATA FEED ACTIVE',
        ]);
      } catch {}
    };
    load();
    const iv = setInterval(load, 60000);
    return () => clearInterval(iv);
  }, []);

  const str = items.map(i => `✦  ${i}`).join('   ');
  return (
    <div className="bg-orange overflow-hidden h-9 flex items-center shrink-0">
      <div className="ticker-inner whitespace-nowrap font-display font-semibold text-cream text-xs tracking-widest">
        {str}&nbsp;&nbsp;&nbsp;&nbsp;{str}&nbsp;&nbsp;&nbsp;&nbsp;{str}
      </div>
    </div>
  );
}

/* ── Navigation (matches ISRO Dribbble nav style) ── */
const NAV = [
  { to: '/',          label: 'Dashboard' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/alerts',    label: 'Alerts' },
  { to: '/about',     label: 'Mission Briefing' },
];

function TopNav() {
  const loc = useLocation();
  const [utc, setUtc] = useState('');
  useEffect(() => {
    const t = () => setUtc(new Date().toISOString().slice(11, 19));
    t(); const iv = setInterval(t, 1000); return () => clearInterval(iv);
  }, []);

  return (
    <nav className="h-16 bg-panel border-b border-border flex items-center justify-between px-8 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-4">
        {/* Orbital Satellite Icon */}
        <div className="relative w-8 h-8 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="none" stroke="#E55C22" strokeWidth="1" strokeDasharray="2 4" strokeOpacity="0.5" />
            <circle cx="30" cy="16" r="2" fill="#FFF8F2" />
          </svg>
          <circle cx="16" cy="16" r="5" fill="#141210" stroke="#999591" strokeWidth="1.5" />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 32 32">
             <ellipse cx="16" cy="16" rx="2" ry="5" fill="none" stroke="#999591" strokeWidth="0.5" strokeOpacity="0.5" />
          </svg>
        </div>

        <span className="font-display font-bold text-2xl tracking-widest">
          <span className="text-orange">ISR</span><span className="text-cream">O</span>
        </span>
        <span className="border-l border-border pl-4 font-sans text-xs text-muted tracking-wider">
          Space Radiation Forecast
        </span>
      </div>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-1">
        {NAV.map(n => {
          const act = loc.pathname === n.to;
          return (
            <Link key={n.to} to={n.to}
              className={`px-4 py-2 rounded-pill font-sans text-sm font-medium transition-colors
                ${act ? 'bg-orange text-cream' : 'text-muted hover:text-cream'}`}>
              {n.label}
            </Link>
          );
        })}
      </div>

      {/* UTC Clock */}
      <div className="font-mono text-sm text-muted">
        <span className="text-orange">UTC</span> {utc}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <div className="h-screen w-full flex flex-col bg-bg overflow-hidden">
      <OrangeTicker />
      <TopNav />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/analytics" element={<ForecastAnalytics />} />
          <Route path="/alerts"    element={<AlertCenter />} />
          <Route path="/about"     element={<AboutProject />} />
        </Routes>
      </main>
    </div>
  );
}
