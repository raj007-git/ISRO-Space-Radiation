import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

export default function ForecastAnalytics() {
  const [tele, setTele] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [hRes, cRes] = await Promise.all([
          fetch('https://isro-space-radiation.onrender.com/api/v1/telemetry-history')
          fetch('https://isro-space-radiation.onrender.com/api/v1/current-space-weather')
        ]);
        const hj = await hRes.json();
        setTele(hj.telemetry || []);
        setCurrent(await cRes.json());
      } catch {}
    };
    load();
  }, []);

  const step = Math.max(1, Math.floor(tele.length / 60));
  const sampled = tele.filter((_, i) => i % step === 0).map((t, i) => ({
    t: i % 10 === 0 ? new Date(t.time).toISOString().slice(11, 16) : '',
    flux: t.flux, speed: t.wind_speed, density: t.wind_density,
    bx: t.bx, by: t.by, bz: t.bz,
  }));

  const tooltipStyle = { background: '#1E1C1A', border: '1px solid #33312F', fontFamily: 'JetBrains Mono', fontSize: 11, borderRadius: 12 };

  return (
    <div className="px-8 py-8 max-w-[1300px] mx-auto space-y-6">
      <div>
        <h1 className="font-display font-black text-3xl text-cream">Space Weather Workstation</h1>
        <div className="label mt-1">Live NOAA Instrument Cluster · ~24h Telemetry Window</div>
      </div>

      {/* ── Live Readings Bar ── */}
      <div className="card p-5 grid grid-cols-3 md:grid-cols-6 gap-4">
        {[
          /* FIX C-1 + C-5: Correct energy label and unit for electron flux */
          { label: 'Electron Flux ≥2 MeV', val: current?.Electron_Flux, unit: 'electrons / cm² / s', color: 'text-igreen' },
          { label: 'Wind Speed',            val: current?.Solar_Wind_Speed,    unit: 'km/s',       color: 'text-orange' },
          /* FIX N-2: unit particles / cm³ is standard for number density, not particles / cm³ */
          { label: 'Proton Density',        val: current?.Solar_Wind_Density,  unit: 'particles / cm³',       color: 'text-warn' },
          { label: 'IMF Bx (GSM)',          val: current?.Bx, unit: 'nT', color: 'text-muted' },
          { label: 'IMF By (GSM)',          val: current?.By, unit: 'nT', color: 'text-muted' },
          { label: 'IMF Bz (GSM)',          val: current?.Bz, unit: 'nT', color: 'text-crit' },
        ].map(r => (
          <div key={r.label} className="text-center">
            <div className="label text-[9px] mb-1">{r.label}</div>
            <div className={`font-display font-bold text-xl ${r.color}`}>
              {r.val != null ? Number(r.val).toFixed(1) : '--'}
            </div>
            <div className="font-mono text-[10px] text-muted">{r.unit}</div>
          </div>
        ))}
      </div>

      {/* ── Instrument Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* FIX C-1 + M-3: Correct energy label; correct instrument name */}
        <Instrument
          title="Electron Flux [≥2 MeV]"
          src="GOES-16 · SEISS/EPS Instrument"
          unit="electrons / cm² / s"
          data={sampled} dataKey="flux" color="#138808" />
        {/* WIND Solar Wind Experiment (SWE) measures plasma */}
        <Instrument
          title="Solar Wind Velocity"
          src="WIND · SWE Instrument"
          unit="km/s"
          data={sampled} dataKey="speed" color="#E55C22" />
        {/* FIX N-2: Proton Density with correct unit */}
        <Instrument
          title="Solar Wind Proton Density"
          src="WIND · SWE Instrument"
          unit="particles / cm³"
          data={sampled} dataKey="density" color="#FFC857" />

        {/* IMF multi-line */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex justify-between items-center">
            <div>
              {/* FIX M-3: Correct instrument attribution */}
              <div className="font-display font-semibold text-sm text-cream">IMF Components (Bx, By, Bz)</div>
              <div className="label mt-0.5">WIND · MFI (Magnetic Field Investigation) · GSM Coordinates · nT</div>
            </div>
            <div className="flex gap-3 font-mono text-[10px]">
              <span className="text-orange">— Bx</span>
              <span className="text-igreen">— By</span>
              <span className="text-crit">— Bz</span>
            </div>
          </div>
          <div className="h-48 p-2 pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sampled} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="2 6" stroke="#33312F" />
                <XAxis dataKey="t" tick={{ fill:'#999591', fontSize:9, fontFamily:'JetBrains Mono' }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fill:'#999591', fontSize:9, fontFamily:'JetBrains Mono' }}
                  tickLine={false} axisLine={false}
                  label={{ value: 'nT', angle: -90, position: 'insideLeft', fill: '#999591', fontSize: 9, dx: -4 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine y={0} stroke="#999591" strokeOpacity={0.3} />
                <Line type="monotone" dataKey="bx" name="Bx" stroke="#E55C22" strokeWidth={1} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="by" name="By" stroke="#138808" strokeWidth={1} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="bz" name="Bz" stroke="#FF4444" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function Instrument({ title, src, data, dataKey, color, unit }) {
  const tooltipStyle = { background: '#1E1C1A', border: '1px solid #33312F', fontFamily: 'JetBrains Mono', fontSize: 11, borderRadius: 12 };
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex justify-between items-center">
        <div>
          <div className="font-display font-semibold text-sm text-cream">{title}</div>
          <div className="label mt-0.5">{src}</div>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-igreen animate-pulse"></div>
      </div>
      <div className="h-48 p-2 pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 10 }}>
            <defs>
              <linearGradient id={`g_${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 6" stroke="#33312F" vertical={false} />
            <XAxis dataKey="t" tick={{ fill:'#999591', fontSize:9, fontFamily:'JetBrains Mono' }} tickLine={false} axisLine={false} />
            {/* FIX M-2: Y-axis labeled per instrument */}
            <YAxis
              tick={{ fill:'#999591', fontSize:9, fontFamily:'JetBrains Mono' }}
              tickLine={false} axisLine={false}
              label={{ value: unit, angle: -90, position: 'insideLeft', fill: '#999591', fontSize: 9, dx: -4 }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} fill={`url(#g_${dataKey})`} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
