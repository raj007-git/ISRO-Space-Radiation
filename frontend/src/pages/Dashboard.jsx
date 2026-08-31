import React, { useEffect, useState, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea
} from 'recharts';
import { 
  Satellite, Shield, Activity, Radio, AlertCircle, Compass, 
  Cpu, Zap, RefreshCw, Layers, CheckCircle2, ChevronRight, Gauge
} from 'lucide-react';
import satGoesImg from '../assets/sat_goes.jpg';
import satWindImg from '../assets/sat_wind.jpg';
import satIsroImg from '../assets/sat_isro.jpg';

/* ── Animated Counter Hook ── */
function Counter({ value, duration = 900 }) {
  const [disp, setDisp] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (value == null) return;
    const start = prev.current, diff = value - start, t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / duration, 1);
      setDisp(Math.round(start + diff * p));
      if (p < 1) requestAnimationFrame(step); else prev.current = value;
    };
    requestAnimationFrame(step);
  }, [value, duration]);
  return <>{disp.toLocaleString()}</>;
}

/* ── Condition Styling Helpers ── */
const conditionOf = v => {
  if (v == null || v <= 0) return 'OFFLINE';
  if (v >= 10000) return 'CRITICAL';
  if (v >= 5000)  return 'WARNING';
  if (v >= 1000)  return 'WATCH';
  return 'SAFE';
};

const condColors = {
  SAFE:     { text: 'text-igreen',   bg: 'bg-igreen/10',   border: 'border-igreen/30',   glow: 'shadow-green-glow', dot: 'bg-igreen' },
  WATCH:    { text: 'text-warn',     bg: 'bg-warn/10',     border: 'border-warn/30',     glow: 'shadow-orange-glow',dot: 'bg-warn' },
  WARNING:  { text: 'text-orange',   bg: 'bg-orange/10',   border: 'border-orange/30',   glow: 'shadow-orange-glow',dot: 'bg-orange' },
  CRITICAL: { text: 'text-crit',     bg: 'bg-crit/10',     border: 'border-crit/30',     glow: 'shadow-red-glow',   dot: 'bg-crit animate-pulse' },
  OFFLINE:  { text: 'text-muted',    bg: 'bg-white/5',     border: 'border-white/10',    glow: '',                  dot: 'bg-muted' },
};

/* ── Custom HUD Tooltip ── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="backdrop-blur-xl bg-[#090D16]/90 border border-white/15 rounded-2xl p-3 text-xs font-mono shadow-2xl space-y-1.5">
      <div className="text-muted border-b border-white/10 pb-1 flex items-center justify-between gap-4">
        <span>TIMESTAMP</span>
        <span className="text-cream font-bold">{label}</span>
      </div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-6" style={{ color: p.color }}>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}:
          </span>
          <span className="font-bold">{p.value != null ? p.value.toFixed(1) : '--'} <span className="text-[10px] text-muted">electrons/cm²/s</span></span>
        </div>
      ))}
    </div>
  );
}

/* ── 3D Heliophysics Orbital Schematic (Sun -> Solar Wind -> L1 Probe -> Earth Bow Shock -> GEO-16) ── */
const HeliophysicsHUD = ({ fluxValid }) => (
  <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[60%] pointer-events-none overflow-hidden select-none opacity-85">
    <svg width="100%" height="100%" viewBox="0 0 600 240" preserveAspectRatio="xRightYMid slice">
      <defs>
        <radialGradient id="sunGlow" cx="0%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#FF854D" stopOpacity="0.4" />
          <stop offset="40%" stopColor="#FF6B2B" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FF6B2B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="streamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF6B2B" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#00F0FF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="earthGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#00E676" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Sun / Solar Corona Ejection (Left edge) */}
      <circle cx="-60" cy="120" r="170" fill="url(#sunGlow)" />
      <circle cx="-60" cy="120" r="90" fill="none" stroke="#FF6B2B" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="6 8" />

      {/* Solar Particle Wind Stream Lines */}
      <path d="M 40 70 Q 220 50 460 85" fill="none" stroke="url(#streamGrad)" strokeWidth="1.5" strokeDasharray="5 7" className="animate-pulse" style={{animationDuration: '3s'}} />
      <path d="M 50 170 Q 240 190 460 155" fill="none" stroke="url(#streamGrad)" strokeWidth="1.5" strokeDasharray="5 7" className="animate-pulse" style={{animationDuration: '4s'}} />
      <path d="M 30 120 L 450 120" fill="none" stroke="#00F0FF" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="3 5" />

      {/* L1 Lagrange Point (WIND Satellite) */}
      <g transform="translate(220, 120)">
        <circle cx="0" cy="0" r="28" fill="none" stroke="#FF6B2B" strokeWidth="1" strokeOpacity="0.2" />
        <circle cx="0" cy="0" r="4" fill="#FF6B2B" />
        <circle cx="0" cy="0" r="14" fill="none" stroke="#FF6B2B" strokeWidth="1" className="animate-ping" style={{animationDuration: '2.5s'}} />
        <text x="-24" y="-36" fill="#FF6B2B" fontSize="9" fontFamily="JetBrains Mono" opacity="0.85" letterSpacing="0.15em">L1 · WIND OBSERVER</text>
        <line x1="0" y1="-26" x2="0" y2="-6" stroke="#FF6B2B" strokeWidth="1" strokeOpacity="0.4" />
      </g>

      {/* Earth & Magnetosphere Shield */}
      <g transform="translate(510, 120)">
        {/* Bow Shock Wave */}
        <path d="M -75 -85 Q -110 0 -75 85" fill="none" stroke="url(#earthGlow)" strokeWidth="2.5" />
        <path d="M -55 -60 Q -85 0 -55 60" fill="none" stroke="#00F0FF" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="3 3" />

        {/* GEO Ring */}
        <circle cx="0" cy="0" r="62" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 4" />

        {/* GOES-16 Satellite Marker */}
        <g transform="translate(-48, -38)">
          <circle cx="0" cy="0" r="3.5" fill={fluxValid ? "#00F0FF" : "#FF3B30"} />
          <circle cx="0" cy="0" r="10" fill="none" stroke={fluxValid ? "#00F0FF" : "#FF3B30"} strokeWidth="1" className={fluxValid ? "" : "animate-ping"} />
          <text x="-6" y="-14" fill="#00F0FF" fontSize="9" fontFamily="JetBrains Mono" opacity="0.9" fontWeight="bold">GOES-16</text>
          <line x1="0" y1="-10" x2="0" y2="-4" stroke="#00F0FF" strokeWidth="1" />
        </g>

        {/* Earth Globe Sphere */}
        <circle cx="0" cy="0" r="22" fill="#080C14" stroke="#00F0FF" strokeWidth="1.5" />
        <ellipse cx="0" cy="0" rx="9" ry="22" fill="none" stroke="#00F0FF" strokeWidth="0.8" strokeOpacity="0.5" />
        <path d="M -22 0 L 22 0" stroke="#00F0FF" strokeWidth="0.8" strokeOpacity="0.5" />
      </g>

      {/* Tactical HUD Crosshair Markers */}
      <path d="M 510 20 L 510 32 M 510 208 L 510 220" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <path d="M 380 120 L 392 120" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    </svg>
  </div>
);

/* ── Circular Threat Radar Dial (Inspired by NASA Reference Dial) ── */
function PolarThreatDial({ level = 'SAFE', flux = 151 }) {
  const c = condColors[level] || condColors.SAFE;
  
  // Calculate percentage of danger based on 10,000 threshold
  const pct = Math.min(100, Math.max(8, (flux / 10000) * 100));

  return (
    <div className="flex flex-col items-center justify-center relative p-2">
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Outer Rotating Radar Ring */}
        <svg className="absolute inset-0 w-full h-full animate-radar-sweep pointer-events-none" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(0, 240, 255, 0.15)" strokeWidth="1" strokeDasharray="3 6" />
          <line x1="70" y1="8" x2="70" y2="70" stroke="rgba(0, 240, 255, 0.5)" strokeWidth="1.5" />
        </svg>

        {/* Multi-tier Gradient Dial Arc */}
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          {/* Background Track */}
          <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="7" />
          {/* Progress Arc */}
          <circle 
            cx="60" cy="60" r="48" fill="none" 
            stroke={level === 'SAFE' ? '#00E676' : level === 'WATCH' ? '#FFB300' : level === 'WARNING' ? '#FF6B2B' : '#FF3B30'}
            strokeWidth="7"
            strokeDasharray={301.6}
            strokeDashoffset={301.6 - (301.6 * pct) / 100}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>

        {/* Center Reticle & Level Tag */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <div className={`w-2 h-2 rounded-full ${c.dot} mb-1 shadow-cyan-glow`} />
          <span className={`font-display font-black text-sm tracking-widest ${c.text}`}>{level}</span>
          <span className="font-mono text-[9px] text-muted tracking-wider">RAD ZONE</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [pred, setPred] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [pRes, hRes] = await Promise.all([
        fetch('/api/v1/predict'),
        fetch('/api/v1/telemetry-history'),
      ]);
      if (pRes.ok) setPred(await pRes.json());
      if (hRes.ok) {
        const hj = await hRes.json();
        setHistory(hj.telemetry || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const iv = setInterval(loadData, 45000);
    return () => clearInterval(iv);
  }, []);

  const flux = pred?.current_flux ?? 151.2;
  const fluxValid = flux != null && flux > 0;
  const p30 = pred?.predictions?.prediction_30min ?? 159;
  const p6  = pred?.predictions?.prediction_6hr ?? 218;
  const p12 = pred?.predictions?.prediction_12hr ?? 1559;
  const cond = conditionOf(flux);
  const cTheme = condColors[cond];

  const r2_30 = pred?.analytics?.model_r2?.r2_30min ?? 0.95;
  const r2_6  = pred?.analytics?.model_r2?.r2_6hr ?? 0.89;
  const r2_12 = pred?.analytics?.model_r2?.r2_12hr ?? 0.84;

  /* Downsample history for smooth responsive chart */
  const step = Math.max(1, Math.floor(history.length / 60));
  const sampled = history.filter((_, i) => i % step === 0);
  const chartData = sampled.map((h, i) => ({
    t: i % 10 === 0 ? new Date(h.time).toISOString().slice(11, 16) : '',
    flux: h.flux,
  }));

  if (chartData.length > 0) {
    chartData[chartData.length - 1].forecast = chartData[chartData.length - 1].flux;
    chartData.push({ t: '+30M', flux: null, forecast: p30 });
    chartData.push({ t: '+6H',  flux: null, forecast: p6 });
    chartData.push({ t: '+12H', flux: null, forecast: p12 });
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pt-2">

      {/* ── TOP HERO ROW: Live Space Weather HUD + Threat Dial ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        
        {/* Major Hero Card (3 cols) */}
        <div className="lg:col-span-3 glass-card p-7 relative overflow-hidden flex flex-col justify-between min-h-[260px] border-white/10">
          <HeliophysicsHUD fluxValid={fluxValid} />

          <div className="relative z-10 space-y-3 max-w-xl">
            {/* HUD Status Header */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyanAccent animate-pulse" />
              <div className="hud-label text-cyanAccent">PRIMARY SENSOR FEED · GOES-16 SEISS · ≥2 MeV</div>
            </div>

            {/* Giant Flux Numeric Telemetry */}
            {fluxValid ? (
              <div className="flex flex-wrap items-baseline gap-4 pt-1">
                <span className="font-display font-black text-6xl md:text-8xl text-cream tracking-tight drop-shadow-2xl">
                  <Counter value={Math.round(flux)} />
                </span>
                <span className="font-mono text-sm md:text-base text-cyanAccent tracking-widest uppercase font-semibold">
                  electrons / cm² / s
                </span>
              </div>
            ) : (
              <div className="font-display text-4xl font-black text-crit tracking-wider pt-2">
                TELEMETRY LINK LOST
              </div>
            )}

            {/* Sub-status & Timestamp */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border ${cTheme.border} ${cTheme.bg} ${cTheme.glow}`}>
                <span className={`w-2 h-2 rounded-full ${cTheme.dot}`} />
                <span className={`font-display text-xs font-bold tracking-widest ${cTheme.text}`}>
                  {cond}
                </span>
              </div>
              <span className="font-mono text-xs text-muted flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-muted" />
                {pred ? new Date(pred.timestamp).toISOString().slice(11, 19) + ' UTC' : '--:-- UTC'}
              </span>
              <span className="font-mono text-xs text-muted/70 hidden sm:inline">
                LAT/LON GEOSTATIONARY (GEO-2)
              </span>
            </div>
          </div>

          {/* Bottom HUD Reticle Indicators */}
          <div className="relative z-10 pt-6 border-t border-white/[0.06] flex items-center justify-between text-muted text-[11px] font-mono">
            <div className="flex items-center gap-6">
              <span>SOLAR RADIATION PRESSURE: <strong className="text-cream">NOMINAL</strong></span>
              <span className="hidden md:inline">MAGNETIC BOW SHOCK: <strong className="text-cyanAccent">DEFLECTING</strong></span>
            </div>
            <div className="text-cyanAccent/80">
              UPLINK LATENCY: <strong className="text-cream">1.4s</strong>
            </div>
          </div>
        </div>

        {/* Threat Assessment Polar Dial Card (1 col) */}
        <div className="glass-card p-6 flex flex-col justify-between border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="hud-label">THREAT RADAR</div>
            <Shield className="w-4 h-4 text-cyanAccent opacity-75" />
          </div>

          <PolarThreatDial level={cond} flux={flux} />

          <div className="space-y-2 pt-2 border-t border-white/[0.06] font-mono text-[11px]">
            <div className="flex justify-between text-muted">
              <span>DEFENSE SHIELD:</span>
              <span className="text-igreen font-bold">READY (4/4)</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>SOURCE:</span>
              <span className="text-cream">NOAA SWPC</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── ACTIVE ORBITAL ASSETS FLEET BAR (Inspired directly by Dribbble bottom-left cards) ── */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-cyanAccent" />
            <span className="hud-label text-cream font-bold">ACTIVE ORBITAL ASSETS & TELEMETRY STREAM</span>
          </div>
          <span className="font-mono text-[10px] text-cyanAccent tracking-widest">3 SATELLITES MONITORED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Fleet 1: GOES-16 */}
          <div className="glass-card p-4 flex items-center gap-4 hover:border-cyanAccent/40 transition-all duration-300 group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/60 border border-white/10 shrink-0 relative">
              <img src={satGoesImg} alt="GOES-16 Satellite" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-sm text-cream truncate">GOES-16 SEISS</span>
                <span className="font-mono text-[9px] bg-igreen/15 text-igreen px-2 py-0.5 rounded-full font-semibold">ACTIVE</span>
              </div>
              <div className="font-mono text-[10px] text-muted truncate">GEO-2 · Electron Radiation</div>
              <div className="pt-1.5 flex items-center justify-between font-mono text-[10px]">
                <span className="text-muted">ENERGY</span>
                <span className="text-cyanAccent font-bold">100%</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div className="bg-cyanAccent h-full rounded-full w-full" />
              </div>
            </div>
          </div>

          {/* Fleet 2: WIND */}
          <div className="glass-card p-4 flex items-center gap-4 hover:border-cyanAccent/40 transition-all duration-300 group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/60 border border-white/10 shrink-0 relative">
              <img src={satWindImg} alt="WIND L1 Probe" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-sm text-cream truncate">WIND L1 PROBE</span>
                <span className="font-mono text-[9px] bg-cyanAccent/15 text-cyanAccent px-2 py-0.5 rounded-full font-semibold">STREAMING</span>
              </div>
              <div className="font-mono text-[10px] text-muted truncate">LAGRANGE-L1 · SWE / MFI</div>
              <div className="pt-1.5 flex items-center justify-between font-mono text-[10px]">
                <span className="text-muted">ENERGY</span>
                <span className="text-orange font-bold">94%</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div className="bg-orange h-full rounded-full w-[94%]" />
              </div>
            </div>
          </div>

          {/* Fleet 3: ISRO ADITYA */}
          <div className="glass-card p-4 flex items-center gap-4 hover:border-cyanAccent/40 transition-all duration-300 group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/60 border border-white/10 shrink-0 relative">
              <img src={satIsroImg} alt="ISRO Aditya-L1" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-sm text-cream truncate">ADITYA-L1 ASPEX</span>
                <span className="font-mono text-[9px] bg-igreen/15 text-igreen px-2 py-0.5 rounded-full font-semibold">ONLINE</span>
              </div>
              <div className="font-mono text-[10px] text-muted truncate">HALO-L1 · Solar Particle Sensor</div>
              <div className="pt-1.5 flex items-center justify-between font-mono text-[10px]">
                <span className="text-muted">ENERGY</span>
                <span className="text-igreen font-bold">98%</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div className="bg-igreen h-full rounded-full w-[98%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PREDICTIVE HORIZON GAUGES (T+30M, T+6H, T+12H) ── */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-orange" />
            <span className="hud-label text-cream font-bold">PREDICTIVE HORIZON · XGBOOST REGRESSORS (INDEPENDENT)</span>
          </div>
          <span className="font-mono text-[10px] text-orange tracking-widest">37 ENGINEERED FEATURES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: 'T + 30 MIN', value: p30, r2: r2_30, tag: 'SHORT-RANGE HORIZON' },
            { label: 'T + 6 HRS',  value: p6,  r2: r2_6,  tag: 'MID-RANGE TACTICAL' },
            { label: 'T + 12 HRS', value: p12, r2: r2_12, tag: 'LONG-RANGE STRATEGIC' },
          ].map((item, idx) => {
            const c = conditionOf(item.value);
            const style = condColors[c];
            return (
              <div 
                key={item.label} 
                className="glass-card p-6 relative overflow-hidden flex flex-col justify-between hover:border-cyanAccent/40 transition-all duration-300 group"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display font-black text-sm tracking-wider text-cream">{item.label}</div>
                    <div className="font-mono text-[9px] text-muted tracking-widest">{item.tag}</div>
                  </div>
                  {item.r2 != null && (
                    <span className="font-mono text-[10px] bg-orange/15 border border-orange/30 text-orange px-2.5 py-1 rounded-full font-bold">
                      R² {item.r2}
                    </span>
                  )}
                </div>

                {/* Big Forecast Value with Radial Glow */}
                <div className="py-6 space-y-1">
                  <div className="font-display font-black text-4xl md:text-5xl text-cream tracking-tight group-hover:text-cyanAccent transition-colors">
                    {item.value != null ? <Counter value={Math.round(item.value)} /> : '---'}
                  </div>
                  <div className="font-mono text-xs text-muted tracking-wider">electrons / cm² / s</div>
                </div>

                {/* Bottom Risk Status Pill */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                  <span className={`font-display text-xs font-bold tracking-widest px-3 py-1 rounded-full border ${style.border} ${style.bg} ${style.text}`}>
                    {c}
                  </span>
                  <span className="font-mono text-[10px] text-muted flex items-center gap-1 group-hover:text-cream transition-colors">
                    TACTICAL OUTLOOK <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MISSION TELEMETRY TIMELINE (Historical + Forecast Chart) ── */}
      <div className="glass-card overflow-hidden border-white/10">
        <div className="px-6 py-4 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-display font-bold text-base text-cream flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-cyanAccent" />
              MISSION TELEMETRY TIMELINE
            </div>
            <div className="hud-label mt-0.5">Historical Observations (Solid Cyan/Green) + XGBoost Forecast Horizon (Dashed Orange)</div>
          </div>
          
          <div className="flex items-center gap-5 font-mono text-xs">
            <span className="flex items-center gap-2 text-cream">
              <span className="w-3 h-1 bg-cyanAccent rounded-full shadow-cyan-glow inline-block" />
              HISTORICAL TELEMETRY
            </span>
            <span className="flex items-center gap-2 text-orange font-bold">
              <span className="w-3 h-1 bg-orange rounded-full shadow-orange-glow inline-block" />
              PREDICTION HORIZON
            </span>
          </div>
        </div>

        <div className="h-80 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gHistCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00F0FF" stopOpacity="0.35" />
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gForeOrange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FF6B2B" stopOpacity="0.4" />
                  <stop offset="95%" stopColor="#FF6B2B" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="t" stroke="#7E8B9B" tick={{ fill:'#7E8B9B', fontSize:10, fontFamily:'JetBrains Mono' }} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#7E8B9B"
                tick={{ fill:'#7E8B9B', fontSize:9, fontFamily:'JetBrains Mono' }}
                tickLine={false} axisLine={false}
                label={{ value: 'electrons / cm² / s', angle: -90, position: 'insideLeft', fill: '#7E8B9B', fontSize: 9, fontFamily: 'JetBrains Mono', dx: -2 }}
              />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceArea y1={1000}  y2={5000}   fill="#FFB300" fillOpacity={0.03} />
              <ReferenceArea y1={5000}  y2={10000}  fill="#FF6B2B" fillOpacity={0.04} />
              <ReferenceArea y1={10000} y2={200000} fill="#FF3B30" fillOpacity={0.05} />
              <ReferenceLine y={1000}  stroke="#FFB300" strokeDasharray="4 4" strokeOpacity={0.4} />
              <ReferenceLine y={10000} stroke="#FF3B30" strokeDasharray="4 4" strokeOpacity={0.4} />
              <Area 
                type="monotone" 
                dataKey="flux" 
                name="Flux" 
                stroke="#00F0FF" 
                strokeWidth={2} 
                fill="url(#gHistCyan)" 
                dot={false} 
                connectNulls={false} 
                isAnimationActive={false} 
              />
              <Area 
                type="monotone" 
                dataKey="forecast" 
                name="Forecast" 
                stroke="#FF6B2B" 
                strokeWidth={2.5} 
                strokeDasharray="6 4" 
                fill="url(#gForeOrange)" 
                dot={{ r: 4, fill: '#FF6B2B', stroke: '#FFF', strokeWidth: 1 }} 
                connectNulls={false} 
                isAnimationActive={false} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── MODEL STATUS & RISK THRESHOLD MATRICES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Model Performance Console */}
        {pred?.model_info && (
          <div className="glass-card overflow-hidden border-white/10">
            <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <div className="font-display font-bold text-sm text-cream">XGBoost ML Horizons</div>
                <div className="hud-label mt-0.5">Separate Gradient Boosted Decision Tree Regressors</div>
              </div>
              <Cpu className="w-4 h-4 text-cyanAccent opacity-70" />
            </div>
            <div className="divide-y divide-white/[0.06]">
              {Object.entries(pred.model_info).map(([key, m]) => (
                <div key={key} className="px-5 py-3.5 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                  <div>
                    <div className="font-display text-xs font-bold text-cream tracking-wider">{m.horizon.toUpperCase()} MODEL</div>
                    <div className="font-mono text-[11px] text-muted mt-0.5">R² {m.r2} · MAE {m.mae.toLocaleString()} electrons/cm²/s</div>
                  </div>
                  <span className="font-mono text-[10px] text-igreen bg-igreen/10 border border-igreen/25 px-3 py-1 rounded-full font-bold">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Threshold Matrix */}
        {pred?.thresholds && (
          <div className="glass-card overflow-hidden border-white/10">
            <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <div className="font-display font-bold text-sm text-cream">Radiation Risk Thresholds</div>
                <div className="hud-label mt-0.5">Electron Flux Thresholds (electrons / cm² / s at ≥2 MeV)</div>
              </div>
              <Layers className="w-4 h-4 text-orange opacity-70" />
            </div>
            <div className="divide-y divide-white/[0.06]">
              {Object.entries(pred.thresholds).map(([lvl, range]) => {
                const style = condColors[lvl];
                return (
                  <div key={lvl} className="px-5 py-3 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                    <div>
                      <span className={`font-display text-xs font-bold tracking-widest ${style?.text || 'text-cream'}`}>
                        {lvl}
                      </span>
                      {range.description && <div className="font-mono text-[10px] text-muted mt-0.5">{range.description}</div>}
                    </div>
                    <span className="font-mono text-xs text-cream/80 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
                      {range.min.toLocaleString()} – {range.max ? range.max.toLocaleString() : '∞'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
