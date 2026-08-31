import React, { useEffect, useState, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea
} from 'recharts';
import MetricCard from '../components/MetricCard';
import PredictionPanel from '../components/PredictionPanel';
import AnimatedStatusBadge from '../components/AnimatedStatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';

/* ── Animated counter ── */
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
  }, [value]);
  return <>{disp.toLocaleString()}</>;
}

/* ── Space UI Components ── */
const SystemSchematic = ({ fluxValid }) => (
  <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none overflow-hidden select-none">
    <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="xRightYMid slice">
      <defs>
        <radialGradient id="sun" cx="0%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E55C22" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#E55C22" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="windFlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E55C22" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#E55C22" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="magneto" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#138808" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#138808" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Sun Body */}
      <circle cx="-50" cy="100" r="150" fill="url(#sun)" />
      <circle cx="-50" cy="100" r="80" fill="none" stroke="#E55C22" strokeWidth="1" strokeOpacity="0.15" strokeDasharray="4 8" />

      {/* Solar Wind Waves */}
      <path d="M 50 60 Q 200 40 380 70" fill="none" stroke="url(#windFlow)" strokeWidth="1" strokeDasharray="4 6" className="animate-pulse" style={{animationDuration: '3s'}} />
      <path d="M 60 140 Q 220 160 380 130" fill="none" stroke="url(#windFlow)" strokeWidth="1" strokeDasharray="4 6" className="animate-pulse" style={{animationDuration: '4s'}} />
      <path d="M 40 100 L 370 100" fill="none" stroke="#E55C22" strokeWidth="1" strokeOpacity="0.15" strokeDasharray="2 4" />

      {/* L1 Point (WIND Satellite) */}
      <g transform="translate(180, 100)">
        <circle cx="0" cy="0" r="24" fill="none" stroke="#E55C22" strokeWidth="1" strokeOpacity="0.2" />
        <circle cx="0" cy="0" r="4" fill="#E55C22" />
        <circle cx="0" cy="0" r="12" fill="none" stroke="#E55C22" strokeWidth="1" className="animate-ping" style={{animationDuration: '2s'}} />
        <text x="-12" y="-30" fill="#E55C22" fontSize="9" fontFamily="JetBrains Mono" opacity="0.6" letterSpacing="0.1em">L1 / WIND</text>
        <line x1="0" y1="-20" x2="0" y2="-6" stroke="#E55C22" strokeWidth="1" strokeOpacity="0.4" />
      </g>

      {/* Earth & Magnetosphere */}
      <g transform="translate(420, 100)">
        {/* Bow Shock */}
        <path d="M -60 -70 Q -90 0 -60 70" fill="none" stroke="url(#magneto)" strokeWidth="1.5" />
        <path d="M -45 -50 Q -70 0 -45 50" fill="none" stroke="#138808" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="2 2" />

        {/* GEO Orbit Ring */}
        <circle cx="0" cy="0" r="50" fill="none" stroke="#33312F" strokeWidth="1" strokeDasharray="3 3" />

        {/* GOES-16 Satellite */}
        <g transform="translate(-40, -30)">
          <circle cx="0" cy="0" r="3" fill={fluxValid ? "#FFF8F2" : "#FF4444"} />
          <circle cx="0" cy="0" r="8" fill="none" stroke={fluxValid ? "#138808" : "#FF4444"} strokeWidth="1" className={fluxValid ? "" : "animate-ping"} />
          <text x="-4" y="-12" fill="#999591" fontSize="9" fontFamily="JetBrains Mono" opacity="0.8">GOES-16</text>
          <line x1="0" y1="-8" x2="0" y2="-4" stroke="#999591" strokeWidth="1" />
        </g>

        {/* Earth Body */}
        <circle cx="0" cy="0" r="16" fill="#141210" stroke="#999591" strokeWidth="1.5" />
        <ellipse cx="0" cy="0" rx="6" ry="16" fill="none" stroke="#999591" strokeWidth="1" strokeOpacity="0.3" />
        <path d="M -16 0 L 16 0" stroke="#999591" strokeWidth="1" strokeOpacity="0.3" />
      </g>

      {/* Crosshairs & Grid Accents */}
      <path d="M 420 10 L 420 20 M 420 180 L 420 190" stroke="#33312F" strokeWidth="1" />
      <path d="M 320 100 L 330 100" stroke="#33312F" strokeWidth="1" />
    </svg>
  </div>
);

const RadarOverlay = () => (
  <svg className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 pointer-events-none" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" fill="none" stroke="#E55C22" strokeWidth="1" strokeDasharray="2 4" />
    <circle cx="50" cy="50" r="20" fill="none" stroke="#E55C22" strokeWidth="1" strokeDasharray="2 4" />
    <path d="M 50 0 L 50 100 M 0 50 L 100 50" stroke="#E55C22" strokeWidth="0.5" />
  </svg>
);

/* ── Risk helpers — unified SAFE/WATCH/WARNING/CRITICAL vocabulary ── */
const conditionOf = v => {
  if (v == null || v <= 0) return 'OFFLINE';
  if (v >= 10000) return 'CRITICAL';
  if (v >= 5000)  return 'WARNING';
  if (v >= 1000)  return 'WATCH';
  return 'SAFE';
};
const condColor = c =>
  c === 'SAFE' ? 'text-igreen' : c === 'WATCH' ? 'text-warn' :
  c === 'WARNING' ? 'text-orange' : c === 'CRITICAL' ? 'text-crit' : 'text-muted';
const condBg = c =>
  c === 'SAFE' ? 'bg-igreen' : c === 'WATCH' ? 'bg-warn' :
  c === 'WARNING' ? 'bg-orange' : c === 'CRITICAL' ? 'bg-crit' : 'bg-border';

/* ── Custom Tooltip ── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-panel border border-border rounded-xl px-4 py-3 text-xs font-mono shadow-xl">
      <div className="text-muted mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {p.value?.toFixed(1)} electrons / cm² / s
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [pred, setPred] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, hRes] = await Promise.all([
          fetch('/api/v1/predict'),
          fetch('/api/v1/telemetry-history'),
        ]);
        if (pRes.ok) setPred(await pRes.json());
        const hj = await hRes.json();
        setHistory(hj.telemetry || []);
      } catch {}
    };
    load();
  }, []);

  const flux  = pred?.current_flux;
  const fluxValid = flux != null && flux > 0;
  const p30   = pred?.predictions?.prediction_30min;
  const p6    = pred?.predictions?.prediction_6hr;
  const p12   = pred?.predictions?.prediction_12hr;
  const cond  = conditionOf(flux);
  // R² from training evaluation — genuine per-model metric, not live confidence
  const r2_30 = pred?.analytics?.model_r2?.r2_30min;
  const r2_6  = pred?.analytics?.model_r2?.r2_6hr;
  const r2_12 = pred?.analytics?.model_r2?.r2_12hr;

  /* Build chart: sampled history + forecast */
  const step = Math.max(1, Math.floor(history.length / 60));
  const sampled = history.filter((_, i) => i % step === 0);
  const chartData = sampled.map((h, i) => ({
    t: i % 10 === 0 ? new Date(h.time).toISOString().slice(11, 16) : '',
    flux: h.flux,
  }));
  if (fluxValid && chartData.length) {
    chartData[chartData.length - 1].forecast = chartData[chartData.length - 1].flux;
    chartData.push({ t: '+30M', flux: null, forecast: p30 });
    chartData.push({ t: '+6H',  flux: null, forecast: p6 });
    chartData.push({ t: '+12H', flux: null, forecast: p12 });
  }

  return (
    <div className="px-8 py-8 max-w-[1300px] mx-auto space-y-6">

      {/* ── Hero ── */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Current radiation metric card */}
        <div className="card flex-1 p-4 relative overflow-hidden">
          <SystemSchematic fluxValid={fluxValid} />
          <MetricCard
            title="Current Electron Flux"
            value={fluxValid ? Math.round(flux) : '--'}
            unit="electrons / cm² / s"
            risk={cond}
          />
          <div className="mt-2 flex items-center gap-2 text-sm text-muted">
            <AnimatedStatusBadge status={cond} size="h-3 w-3" />
            <span className="ml-1">{cond}</span>
            <span className="ml-4">{pred ? new Date(pred.timestamp).toISOString().slice(11, 19) + ' UTC' : '--:-- UTC'}</span>
          </div>
        </div>

        {/* Mission status card */}
        <div className="card w-56 shrink-0 p-6 flex flex-col justify-between">
          <div className="label mb-4">Mission Status</div>
          <div className="flex flex-col gap-2">
            {['SAFE','WATCH','WARNING','CRITICAL'].map(lvl => {
              const active = cond === lvl;
              return (
                <div key={lvl} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${active ? 'bg-surface' : ''}`}>
                  <AnimatedStatusBadge status={lvl} size="h-2 w-2" />
                  <span className={`font-display text-xs font-semibold tracking-widest ${active ? condColor(lvl) : 'text-border'}`}>{lvl}</span>
                </div>
              );
            })}
          </div>
          <div className="label mt-4">Source: NOAA SWPC</div>
        </div>
      </div>

      {/* ── Predictive Horizon ── */}
        {/* ── Predictive Horizon ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PredictionPanel
            label="T + 30 MIN"
            value={p30}
            unit="electrons / cm² / s"
            risk={conditionOf(p30)}
            confidence={r2_30}
          />
          <PredictionPanel
            label="T + 6 HRS"
            value={p6}
            unit="electrons / cm² / s"
            risk={conditionOf(p6)}
            confidence={r2_6}
          />
          <PredictionPanel
            label="T + 12 HRS"
            value={p12}
            unit="electrons / cm² / s"
            risk={conditionOf(p12)}
            confidence={r2_12}
          />
        </div>
      </div>

      {/* ── Telemetry Timeline ── */}
      <div className="card overflow-hidden">
        <div className="px-6 pt-5 pb-3 border-b border-border flex justify-between items-center">
          <div>
            <div className="font-display font-bold text-base text-cream">Mission Telemetry Timeline</div>
            <div className="label mt-0.5">Historical (solid) + Forecast (dashed) · ~24h window</div>
          </div>
          <div className="flex gap-5 font-mono text-[11px]">
            <span className="flex items-center gap-2"><span className="w-4 h-[2px] bg-igreen inline-block rounded"></span> Historical</span>
            <span className="flex items-center gap-2"><span className="w-4 h-[2px] bg-orange inline-block rounded"></span> Forecast</span>
          </div>
        </div>
        <div className="h-80 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="gHist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#138808" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#138808" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gFore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#E55C22" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#E55C22" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="#33312F" vertical={false} />
              <XAxis dataKey="t" stroke="#999591" tick={{ fill:'#999591', fontSize:10, fontFamily:'JetBrains Mono' }} tickLine={false} axisLine={false} />
              {/* FIX M-2: Y-axis now labeled so chart is scientifically legible */}
              <YAxis
                stroke="#999591"
                tick={{ fill:'#999591', fontSize:9, fontFamily:'JetBrains Mono' }}
                tickLine={false} axisLine={false}
                label={{ value: 'electrons / cm² / s', angle: -90, position: 'insideLeft', fill: '#999591', fontSize: 9, fontFamily: 'JetBrains Mono', dx: -5 }}
              />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceArea y1={1000}  y2={5000}   fill="#FFC857" fillOpacity={0.04} />
              <ReferenceArea y1={5000}  y2={10000}  fill="#E55C22" fillOpacity={0.04} />
              <ReferenceArea y1={10000} y2={200000} fill="#FF4444" fillOpacity={0.04} />
              <ReferenceLine y={1000}  stroke="#FFC857" strokeDasharray="4 4" strokeOpacity={0.5} />
              <ReferenceLine y={10000} stroke="#FF4444" strokeDasharray="4 4" strokeOpacity={0.5} />
              <Area type="monotone" dataKey="flux"     name="Flux"     stroke="#138808" strokeWidth={1.5} fill="url(#gHist)" dot={false} connectNulls={false} isAnimationActive={false} />
              <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#E55C22" strokeWidth={2} strokeDasharray="6 3" fill="url(#gFore)" dot={{ r:3, fill:'#E55C22' }} connectNulls={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Model Status + Thresholds ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pred?.model_info && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="font-display font-bold text-sm text-cream">Forecast Models</div>
              {/* FIX C-4: Correct description — independent per-horizon regressors */}
              <div className="label mt-0.5">Three independent XGBoost Regressors (one per horizon)</div>
            </div>
            <div className="divide-y divide-border">
              {Object.entries(pred.model_info).map(([key, m]) => (
                <div key={key} className="px-5 py-4 flex justify-between items-center">
                  <div>
                    <div className="font-display text-xs font-semibold text-cream tracking-wider">{m.horizon.toUpperCase()}</div>
                    {/* FIX C-5: Correct unit in MAE */}
                    <div className="font-mono text-[11px] text-muted mt-0.5">R² {m.r2} · MAE {m.mae.toLocaleString()} electrons / cm² / s</div>
                  </div>
                  <span className="font-mono text-[10px] text-igreen bg-igreen/10 px-3 py-1 rounded-full">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {pred?.thresholds && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="font-display font-bold text-sm text-cream">Risk Classification</div>
              {/* FIX C-5 + C-3: Correct unit and unified vocabulary */}
              <div className="label mt-0.5">Electron flux thresholds (electrons / cm² / s at ≥2 MeV)</div>
            </div>
            <div className="divide-y divide-border">
              {Object.entries(pred.thresholds).map(([lvl, range]) => (
                <div key={lvl} className="px-5 py-4 flex justify-between items-center">
                  <div>
                    <span className={`font-display text-xs font-bold tracking-widest ${condColor(lvl)}`}>{lvl}</span>
                    {range.description && <div className="font-mono text-[10px] text-muted mt-0.5">{range.description}</div>}
                  </div>
                  <span className="font-mono text-xs text-muted">
                    {range.min.toLocaleString()} – {range.max ? range.max.toLocaleString() : '∞'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
