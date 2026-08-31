import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ForecastAnalytics from './pages/ForecastAnalytics';
import AlertCenter from './pages/AlertCenter';
import AboutProject from './pages/AboutProject';
import spaceBg from './assets/space_bg.jpg';
import IsroLogo from './components/IsroLogo';
import { Activity, ShieldAlert, FileText, LayoutDashboard, Clock } from 'lucide-react';

/* ── Top Navigation Bar ── */
const NAV = [
  { to: '/',          label: 'Dashboard',        icon: LayoutDashboard },
  { to: '/analytics', label: 'Telemetry',        icon: Activity },
  { to: '/alerts',    label: 'Alerts',           icon: ShieldAlert },
  { to: '/about',     label: 'Mission Briefing', icon: FileText },
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
    <header className="px-4 md:px-8 pt-4 pb-2 shrink-0 relative z-30">
      <div className="max-w-[1500px] mx-auto backdrop-blur-xl bg-spacePanel border border-white/[0.08] rounded-2xl px-5 py-3 flex items-center justify-between shadow-glass">
        
        {/* Official ISRO Logo */}
        <IsroLogo className="h-9" />

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-black/30 p-1 rounded-xl border border-white/[0.06]">
          {NAV.map(n => {
            const act = loc.pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-sans text-xs font-semibold tracking-wide transition-all duration-200
                  ${act
                    ? 'bg-orange/20 text-orange border border-orange/40 shadow-glow-orange'
                    : 'text-muted hover:text-cream hover:bg-white/[0.04]'
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 ${act ? 'text-orange' : 'text-muted'}`} />
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* UTC Clock */}
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-3.5 py-1.5 rounded-xl font-mono text-xs text-cream/90">
          <Clock className="w-3.5 h-3.5 text-muted" />
          <span className="text-muted text-[11px]">UTC</span>
          <span className="font-semibold text-cream">{utc}</span>
        </div>

      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="relative min-h-screen w-full flex flex-col bg-bg text-cream overflow-x-hidden selection:bg-orange selection:text-black">
      
      {/* Space Background Layer */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-45 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${spaceBg})`,
        }}
      />

      {/* Main App Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
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
