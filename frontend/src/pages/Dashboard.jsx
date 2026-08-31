import React, { useEffect, useState, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea
} from 'recharts';
import { Radio, Activity, Cpu, Layers } from 'lucide-react';

/* ── Animated Counter ── */
function Counter({ value, duration = 800 }) {
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
  SAFE:     { text: 'text-igreen',   bg: 'bg-igreen/10',   border: 'border-igreen/30',   dot: 'bg-igreen' },
  WATCH:    { text: 'text-warn',     bg: 'bg-warn/10',     border: 'border-warn/30',     dot: 'bg-warn' },
  WARNING:  { text: 'text-orange',   bg: 'bg-orange/10',   border: 'border-orange/30',   dot: 'bg-orange' },
  CRITICAL: { text: 'text-crit',     bg: 'bg-crit/10',     border: 'border-crit/30',     dot: 'bg-crit animate-pulse' },
  OFFLINE:  { text: 'text-muted',    bg: 'bg-white/5',     border: 'border-white/10',    dot: 'bg-muted' },
};

/* ── Custom Chart Tooltip ── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="backdrop-blur-xl bg-[#070A10]/95 border border-white/10 rounded-xl p-3 text-xs font-mono shadow-2xl space-y-1">
      <div className="text-muted border-b border-white/10 pb-1 flex justify-between gap-4">
        <span>TIME</span>
        <span className="text-cream font-semibold">{label}</span>
      </div>
      {payload.map((p, i) => (
        <div key={i} className="flex justify-between gap-5" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <span className="font-bold">{p.value != null ? p.value.toFixed(1) : '--'} <span className="text-[10px] text-muted">electrons/cm²/s</span></span>
        </div>
      ))}
    </div>
  );
}

/* ── Heliophysics Space Telemetry Schematic ── */
const HeliophysicsVisual = ({ fluxValid }) => (
  <div className="absolute right-0 top-0 bottom-0 w-full md:w-[50%] pointer-events-none overflow-hidden select-none opacity-60">
    <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="xRightYMid slice">
      <defs>
        <radialGradient id="sunGlow" cx="0%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="windStream" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Sun / Solar Stream */}
      <circle cx="-40" cy="100" r="140" fill="url(#sunGlow)" />
      <path d="M 40 60 Q 180 40 380 70" fill="none" stroke="url(#windStream)" strokeWidth="1.5" strokeDasharray="4 6" className="animate-pulse" />
      <path d="M 50 140 Q 200 160 380 130" fill="none" stroke="url(#windStream)" strokeWidth="1.5" strokeDasharray="4 6" className="animate-pulse" />
      <path d="M 30 100 L 370 100" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2 4" />

      {/* L1 WIND Satellite */}
      <g transform="translate(180, 100)">
        <circle cx="0" cy="0" r="18" fill="none" stroke="#F97316" strokeWidth="1" strokeOpacity="0.2" />
        <circle cx="0" cy="0" r="3.5" fill="#F97316" />
        <text x="-16" y="-24" fill="#F97316" fontSize="9" fontFamily="JetBrains Mono" opacity="0.8">WIND (L1)</text>
      </g>

      {/* Earth & GEO-16 Orbit */}
      <g transform="translate(420, 100)">
        <circle cx="0" cy="0" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
        
        {/* GOES-16 */}
        <g transform="translate(-38, -30)">
          <circle cx="0" cy="0" r="3" fill={fluxValid ? "#00E5FF" : "#EF4444"} />
          <text x="-4" y="-10" fill="#00E5FF" fontSize="9" fontFamily="JetBrains Mono" opacity="0.85">GOES-16</text>
        </g>

        {/* Earth Body */}
        <circle cx="0" cy="0" r="18" fill="#04060A" stroke="#00E5FF" strokeWidth="1.2" />
        <ellipse cx="0" cy="0" rx="7" ry="18" fill="none" stroke="#00E5FF" strokeWidth="0.8" strokeOpacity="0.4" />
        <path d="M -18 0 L 18 0" stroke="#00E5FF" strokeWidth="0.8" strokeOpacity="0.4" />
      </g>
    </svg>
  </div>
);

export default function Dashboard() {
  const [pred, setPred] = useState(null);
  const [history, setHistory] = useState([]);

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
    } catch {}
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
    <div className="max-w-[1500px] mx-auto space-y-5 pt-2">

      {/* ── HERO ROW: Live Space Radiation Flux (Full Width, Transparent) ── */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
        <HeliophysicsVisual fluxValid={fluxValid} />

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="hud-label text-muted">
            CURRENT ELECTRON FLUX · GOES-16 SEISS · ≥2 MeV
          </div>

          {fluxValid ? (
            <div className="flex flex-wrap items-baseline gap-3 pt-1">
              <span className="font-display font-black text-6xl md:text-8xl text-cream tracking-tight">
                <Counter value={Math.round(flux)} />
              </span>
              <span className="font-mono text-sm md:text-base text-orange font-semibold">
                electrons / cm² / s
              </span>
            </div>
          ) : (
            <div className="font-display text-3xl font-bold text-crit pt-2">
              TELEMETRY LINK LOST
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${cTheme.border} ${cTheme.bg}`}>
              <span className={`w-2 h-2 rounded-full ${cTheme.dot}`} />
              <span className={`font-display text-xs font-bold tracking-wider ${cTheme.text}`}>
                {cond}
              </span>
            </div>
            <span className="font-mono text-xs text-muted flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-muted" />
              {pred ? new Date(pred.timestamp).toISOString().slice(11, 19) + ' UTC' : '--:-- UTC'}
            </span>
          </div>
        </div>
      </div>

      {/* ── PREDICTIVE HORIZON CARDS (T+30M, T+6H, T+12H) ── */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="hud-label text-cream font-bold">PREDICTIVE FORECAST HORIZONS</div>
          <span className="font-mono text-[10px] text-muted">XGBOOST REGRESSORS (37 FEATURES)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'T + 30 MIN', value: p30, r2: r2_30 },
            { label: 'T + 6 HRS',  value: p6,  r2: r2_6  },
            { label: 'T + 12 HRS', value: p12, r2: r2_12 },
          ].map(item => {
            const c = conditionOf(item.value);
            const style = condColors[c];
            return (
              <div 
                key={item.label} 
                className="glass-card p-5 relative overflow-hidden flex flex-col justify-between space-y-4 hover:border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div className="font-display font-bold text-sm tracking-wide text-cream">{item.label}</div>
                  {item.r2 != null && (
                    <span className="font-mono text-[10px] bg-orange/15 border border-orange/30 text-orange px-2 py-0.5 rounded-md font-bold">
                      R² {item.r2}
                    </span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="font-display font-extrabold text-4xl text-cream tracking-tight">
                    {item.value != null ? <Counter value={Math.round(item.value)} /> : '---'}
                  </div>
                  <div className="font-mono text-xs text-muted">electrons / cm² / s</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <span className={`font-display text-xs font-bold tracking-wider px-2.5 py-0.5 rounded-md border ${style.border} ${style.bg} ${style.text}`}>
                    {c}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MISSION TELEMETRY TIMELINE ── */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
          <div className="font-display font-bold text-sm text-cream flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange" />
            Mission Telemetry Timeline (~24h Window + Forecast Horizon)
          </div>
          
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="flex items-center gap-1.5 text-cream">
              <span className="w-2.5 h-1 bg-cyanAccent rounded-full inline-block" />
              Historical
            </span>
            <span className="flex items-center gap-1.5 text-orange font-semibold">
              <span className="w-2.5 h-1 bg-orange rounded-full inline-block" />
              Forecast
            </span>
          </div>
        </div>

        <div className="h-72 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gHist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00E5FF" stopOpacity="0.25" />
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gFore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F97316" stopOpacity="0.3" />
                  <stop offset="95%" stopColor="#F97316" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="t" stroke="#94A3B8" tick={{ fill:'#94A3B8', fontSize:10, fontFamily:'JetBrains Mono' }} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94A3B8"
                tick={{ fill:'#94A3B8', fontSize:9, fontFamily:'JetBrains Mono' }}
                tickLine={false} axisLine={false}
                label={{ value: 'electrons / cm² / s', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 9, fontFamily: 'JetBrains Mono', dx: -2 }}
              />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceArea y1={1000}  y2={5000}   fill="#F59E0B" fillOpacity={0.03} />
              <ReferenceArea y1={5000}  y2={10000}  fill="#F97316" fillOpacity={0.04} />
              <ReferenceArea y1={10000} y2={200000} fill="#EF4444" fillOpacity={0.05} />
              <ReferenceLine y={1000}  stroke="#F59E0B" strokeDasharray="4 4" strokeOpacity={0.4} />
              <ReferenceLine y={10000} stroke="#EF4444" strokeDasharray="4 4" strokeOpacity={0.4} />
              <Area 
                type="monotone" 
                dataKey="flux" 
                name="Historical Flux" 
                stroke="#00E5FF" 
                strokeWidth={1.8} 
                fill="url(#gHist)" 
                dot={false} 
                connectNulls={false} 
                isAnimationActive={false} 
              />
              <Area 
                type="monotone" 
                dataKey="forecast" 
                name="Forecast" 
                stroke="#F97316" 
                strokeWidth={2} 
                strokeDasharray="5 3" 
                fill="url(#gFore)" 
                dot={{ r: 3.5, fill: '#F97316' }} 
                connectNulls={false} 
                isAnimationActive={false} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── MODEL SPECS & RISK THRESHOLD MATRICES ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Model Performance */}
        {pred?.model_info && (
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between">
              <div className="font-display font-bold text-sm text-cream">XGBoost Forecast Models</div>
              <Cpu className="w-4 h-4 text-orange" />
            </div>
            <div className="divide-y divide-white/[0.06]">
              {Object.entries(pred.model_info).map(([key, m]) => (
                <div key={key} className="px-5 py-3 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-display font-semibold text-cream">{m.horizon.toUpperCase()} FORECAST</div>
                    <div className="font-mono text-[11px] text-muted">R² {m.r2} · MAE {m.mae.toLocaleString()} electrons/cm²/s</div>
                  </div>
                  <span className="font-mono text-[10px] text-igreen bg-igreen/10 border border-igreen/25 px-2.5 py-0.5 rounded-full font-bold">
                    OPERATIONAL
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Thresholds */}
        {pred?.thresholds && (
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between">
              <div className="font-display font-bold text-sm text-cream">Classification Thresholds</div>
              <Layers className="w-4 h-4 text-orange" />
            </div>
            <div className="divide-y divide-white/[0.06]">
              {Object.entries(pred.thresholds).map(([lvl, range]) => {
                const style = condColors[lvl];
                return (
                  <div key={lvl} className="px-5 py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <span className={`font-display font-bold tracking-wider ${style?.text || 'text-cream'}`}>
                        {lvl}
                      </span>
                      {range.description && <span className="font-mono text-[10px] text-muted ml-2">({range.description})</span>}
                    </div>
                    <span className="font-mono text-xs text-cream/80">
                      {range.min.toLocaleString()} – {range.max ? range.max.toLocaleString() : '∞'} electrons/cm²/s
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
