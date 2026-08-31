import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Activity, Wind, Magnet, Zap, Radio, Globe, Compass, Cpu, Gauge } from 'lucide-react';

export default function ForecastAnalytics() {
  const [tele, setTele] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [hRes, cRes] = await Promise.all([
          fetch('/api/v1/telemetry-history'),
          fetch('/api/v1/current-space-weather'),
        ]);
        if (hRes.ok) {
          const hj = await hRes.json();
          setTele(hj.telemetry || []);
        }
        if (cRes.ok) {
          setCurrent(await cRes.json());
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
    const iv = setInterval(load, 45000);
    return () => clearInterval(iv);
  }, []);

  const step = Math.max(1, Math.floor(tele.length / 60));
  const sampled = tele.filter((_, i) => i % step === 0).map((t, i) => ({
    t: i % 10 === 0 ? new Date(t.time).toISOString().slice(11, 16) : '',
    flux: t.flux,
    speed: t.wind_speed,
    density: t.wind_density,
    bx: t.bx,
    by: t.by,
    bz: t.bz,
  }));

  const tooltipStyle = {
    background: 'rgba(9, 13, 22, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    fontFamily: 'JetBrains Mono',
    fontSize: 11,
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pt-2">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-cream tracking-tight flex items-center gap-3">
            <Activity className="w-7 h-7 text-cyanAccent" />
            Space Weather Workstation
          </h1>
          <div className="hud-label mt-1 text-muted">
            Live In-Situ Telemetry Cluster · NOAA WIND SWE/MFI + GOES-16 SEISS · ~24H Observation Window
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] px-4 py-2 rounded-full font-mono text-xs text-muted">
          <span className="w-2 h-2 rounded-full bg-cyanAccent animate-pulse" />
          <span>UPSTREAM CADENCE: <strong className="text-cream">1-MIN NATIVE</strong></span>
        </div>
      </div>

      {/* ── Live Readings HUD Cluster ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'Electron Flux ≥2 MeV', val: current?.Electron_Flux ?? 151.2, unit: 'electrons / cm² / s', color: 'text-cyanAccent', border: 'border-cyanAccent/30', icon: Zap },
          { label: 'Solar Wind Speed',      val: current?.Solar_Wind_Speed ?? 417,   unit: 'km/s',                color: 'text-orange',     border: 'border-orange/30',     icon: Wind },
          { label: 'Proton Density',        val: current?.Solar_Wind_Density ?? 7.4, unit: 'particles / cm³',    color: 'text-warn',       border: 'border-warn/30',       icon: Activity },
          { label: 'IMF Bx (GSM)',          val: current?.Bx ?? 1.84,               unit: 'nT',                  color: 'text-muted',      border: 'border-white/10',      icon: Magnet },
          { label: 'IMF By (GSM)',          val: current?.By ?? -2.15,              unit: 'nT',                  color: 'text-muted',      border: 'border-white/10',      icon: Magnet },
          { label: 'IMF Bz (GSM)',          val: current?.Bz ?? -3.11,              unit: 'nT',                  color: 'text-crit',       border: 'border-crit/30',       icon: Compass },
        ].map(r => {
          const Icon = r.icon;
          return (
            <div key={r.label} className={`glass-card p-4 flex flex-col justify-between ${r.border} hover:bg-white/[0.04] transition-all`}>
              <div className="flex items-center justify-between">
                <div className="hud-label text-[9px]">{r.label}</div>
                <Icon className={`w-3.5 h-3.5 ${r.color} opacity-75`} />
              </div>
              <div className="py-2">
                <div className={`font-display font-black text-2xl md:text-3xl ${r.color}`}>
                  {r.val != null ? Number(r.val).toFixed(1) : '--'}
                </div>
                <div className="font-mono text-[10px] text-muted truncate mt-0.5">{r.unit}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 4 Major Tactical Instrument Panels ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Instrument 1: Electron Flux */}
        <InstrumentPanel
          title="Electron Flux [≥2 MeV]"
          src="GOES-16 · SEISS/EPS Radiation Detector"
          unit="electrons / cm² / s"
          data={sampled} 
          dataKey="flux" 
          color="#00F0FF"
          gradientId="gradFlux"
        />

        {/* Instrument 2: Solar Wind Velocity */}
        <InstrumentPanel
          title="Solar Wind Plasma Velocity"
          src="WIND · SWE (Solar Wind Experiment)"
          unit="km/s"
          data={sampled} 
          dataKey="speed" 
          color="#FF6B2B"
          gradientId="gradSpeed"
        />

        {/* Instrument 3: Proton Density */}
        <InstrumentPanel
          title="Solar Wind Proton Density"
          src="WIND · SWE (Solar Wind Experiment)"
          unit="particles / cm³"
          data={sampled} 
          dataKey="density" 
          color="#FFB300"
          gradientId="gradDensity"
        />

        {/* Instrument 4: IMF 3-Axis Components */}
        <div className="glass-card overflow-hidden border-white/10 flex flex-col justify-between">
          <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-sm text-cream">Interplanetary Magnetic Field (Bx, By, Bz)</div>
              <div className="hud-label mt-0.5">WIND · MFI (Magnetic Field Investigation) · GSM Coordinate System · nT</div>
            </div>
            <div className="flex gap-3 font-mono text-[10px]">
              <span className="text-orange flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange" /> Bx</span>
              <span className="text-cyanAccent flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyanAccent" /> By</span>
              <span className="text-crit flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-crit" /> Bz</span>
            </div>
          </div>

          <div className="h-56 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sampled} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="t" tick={{ fill:'#7E8B9B', fontSize:9, fontFamily:'JetBrains Mono' }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fill:'#7E8B9B', fontSize:9, fontFamily:'JetBrains Mono' }}
                  tickLine={false} axisLine={false}
                  label={{ value: 'nT', angle: -90, position: 'insideLeft', fill: '#7E8B9B', fontSize: 9, dx: -4 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="bx" name="Bx (GSM)" stroke="#FF6B2B" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="by" name="By (GSM)" stroke="#00F0FF" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="bz" name="Bz (GSM)" stroke="#FF3B30" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}

function InstrumentPanel({ title, src, data, dataKey, color, unit, gradientId }) {
  const tooltipStyle = {
    background: 'rgba(9, 13, 22, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    fontFamily: 'JetBrains Mono',
    fontSize: 11,
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
  };

  return (
    <div className="glass-card overflow-hidden border-white/10 flex flex-col justify-between">
      <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between">
        <div>
          <div className="font-display font-bold text-sm text-cream">{title}</div>
          <div className="hud-label mt-0.5">{src}</div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-cyanAccent bg-cyanAccent/10 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-cyanAccent animate-pulse" />
          ONLINE
        </div>
      </div>

      <div className="h-56 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 10, right: 10 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="t" tick={{ fill:'#7E8B9B', fontSize:9, fontFamily:'JetBrains Mono' }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fill:'#7E8B9B', fontSize:9, fontFamily:'JetBrains Mono' }}
              tickLine={false} axisLine={false}
              label={{ value: unit, angle: -90, position: 'insideLeft', fill: '#7E8B9B', fontSize: 9, dx: -4 }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2} 
              fill={`url(#${gradientId})`} 
              dot={false} 
              isAnimationActive={false} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
