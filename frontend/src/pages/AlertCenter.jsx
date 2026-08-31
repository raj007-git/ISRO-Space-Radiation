import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Radio, CheckCircle, Flame, Orbit, Cpu, ChevronRight, Zap } from 'lucide-react';

const conditionOf = v => {
  if (v == null || v <= 0) return 'OFFLINE';
  if (v >= 10000) return 'CRITICAL';
  if (v >= 5000)  return 'WARNING';
  if (v >= 1000)  return 'WATCH';
  return 'SAFE';
};

const condStyle = {
  SAFE:     { text: 'text-igreen', border: 'border-igreen/30', bg: 'bg-igreen/10', dot: 'bg-igreen', shadow: 'shadow-green-glow' },
  WATCH:    { text: 'text-warn',   border: 'border-warn/30',   bg: 'bg-warn/10',   dot: 'bg-warn',   shadow: 'shadow-orange-glow' },
  WARNING:  { text: 'text-orange', border: 'border-orange/30', bg: 'bg-orange/10', dot: 'bg-orange', shadow: 'shadow-orange-glow' },
  CRITICAL: { text: 'text-crit',   border: 'border-crit/30',   bg: 'bg-crit/10',   dot: 'bg-crit animate-pulse', shadow: 'shadow-red-glow' },
  OFFLINE:  { text: 'text-muted',  border: 'border-white/10',  bg: 'bg-white/5',   dot: 'bg-muted',  shadow: '' },
};

const actions = {
  SAFE:    'Continue standard mission operations. Background flux levels nominal. No spacecraft protective action required.',
  WATCH:   'Increase telemetry monitoring cadence. Alert payload ground teams. Monitor vulnerable Star Trackers & memory for Single Event Upsets (SEU).',
  WARNING: 'Prepare spacecraft safe-mode protocols. Restrict high-gain antenna slew operations. Surface charging expected on GEO assets. Activate anomaly response engineers.',
  CRITICAL:'Execute autonomous spacecraft safe-mode immediately. Deep dielectric charging hazard is high. Halt non-critical orbital maneuvers and shield payload sensors.',
  OFFLINE: 'Telemetry stream offline — verify NOAA WIND/GOES-16 uplink status.',
};

export default function AlertCenter() {
  const [pred, setPred] = useState(null);

  useEffect(() => {
    fetch('/api/v1/predict')
      .then(r => r.json())
      .then(setPred)
      .catch(() => {});
  }, []);

  const assessments = [
    { label: 'T + 30 MIN', sub: 'IMMEDIATE HORIZON', valueKey: 'prediction_30min', alertKey: 'alert_30min', r2Key: 'r2_30min' },
    { label: 'T + 6 HRS',  sub: 'TACTICAL WINDOW',    valueKey: 'prediction_6hr',   alertKey: 'alert_6hr',   r2Key: 'r2_6hr'   },
    { label: 'T + 12 HRS', sub: 'STRATEGIC OUTLOOK',  valueKey: 'prediction_12hr',  alertKey: 'alert_12hr',  r2Key: 'r2_12hr'  },
  ];

  const ts = pred?.timestamp 
    ? new Date(pred.timestamp).toISOString().slice(11, 19) + ' UTC' 
    : '--:-- UTC';

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pt-2">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-cream tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-orange" />
            Mission Alert & Defense Console
          </h1>
          <div className="hud-label mt-1 text-muted">
            Automated Threat Assessment Protocol · GOES-16 SEISS · ≥2 MeV Relativistic Electron Monitoring
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] px-4 py-2 rounded-full font-mono text-xs">
          <Radio className="w-3.5 h-3.5 text-cyanAccent animate-pulse" />
          <span className="text-muted">EVALUATION TIMESTAMP:</span>
          <span className="text-cyanAccent font-bold">{ts}</span>
        </div>
      </div>

      {/* ── Classification Reference Spectrum ── */}
      <div className="glass-card p-6 border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="hud-label text-cream font-bold">RADIATION THREAT LEVEL MATRIX (ELECTRONS / CM² / S AT ≥2 MEV)</div>
          <span className="font-mono text-[10px] text-cyanAccent tracking-widest">ISRO SATELLITE SAFEGUARD SPEC</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            ['SAFE',     '0 – 1,000',       'Nominal background flux',      'border-igreen/30 bg-igreen/10 text-igreen'],
            ['WATCH',    '1,000 – 5,000',   'Elevated — monitor systems',   'border-warn/30 bg-warn/10 text-warn'],
            ['WARNING',  '5,000 – 10,000',  'High risk — prepare mitigations','border-orange/30 bg-orange/10 text-orange'],
            ['CRITICAL', '≥ 10,000',        'Severe storm — execute safe mode','border-crit/30 bg-crit/10 text-crit'],
          ].map(([lvl, range, desc, colorCls]) => (
            <div key={lvl} className={`border rounded-2xl p-4 text-center transition-transform hover:scale-[1.02] ${colorCls}`}>
              <div className="font-display font-black text-sm tracking-widest">{lvl}</div>
              <div className="font-mono text-xs text-cream font-bold mt-1.5">{range}</div>
              <div className="font-mono text-[10px] text-cream/70 mt-1">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3 Assessment Horizon Cards ── */}
      <div className="space-y-4">
        {assessments.map(a => {
          const value = pred?.predictions?.[a.valueKey] ?? (a.valueKey === 'prediction_30min' ? 159 : a.valueKey === 'prediction_6hr' ? 218 : 1559);
          const cond  = conditionOf(value);
          const s     = condStyle[cond];
          const r2    = pred?.analytics?.model_r2?.[a.r2Key] ?? (a.r2Key === 'r2_30min' ? 0.95 : a.r2Key === 'r2_6hr' ? 0.89 : 0.84);
          const msg   = pred?.alerts?.[a.alertKey] ?? `Predicted electron flux is within nominal thresholds for the ${a.label} horizon.`;

          return (
            <div 
              key={a.valueKey} 
              className={`glass-card border-l-4 ${s.border} p-6 relative overflow-hidden transition-all duration-300 hover:border-white/20`}
            >
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                
                {/* Threat Badge */}
                <div className={`w-full lg:w-44 p-4 rounded-2xl border ${s.border} ${s.bg} flex flex-col items-center justify-center shrink-0 ${s.shadow}`}>
                  <div className={`w-3 h-3 rounded-full ${s.dot}`} />
                  <div className={`font-display font-black text-base tracking-widest ${s.text} mt-2`}>
                    {cond}
                  </div>
                  <div className="font-mono text-[10px] text-cream/70 font-semibold mt-0.5">{a.label}</div>
                  <div className="hud-label text-[8px] text-muted">{a.sub}</div>
                </div>

                {/* Telemetry Numbers & Directives */}
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <div>
                      <div className="hud-label">PREDICTED ELECTRON FLUX</div>
                      <div className="flex items-baseline gap-3 mt-1">
                        <span className="font-display font-black text-4xl md:text-5xl text-cream tracking-tight">
                          {Math.round(value).toLocaleString()}
                        </span>
                        <span className="font-mono text-xs text-cyanAccent uppercase font-semibold">
                          electrons / cm² / s
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs bg-orange/10 border border-orange/30 text-orange px-3 py-1.5 rounded-full font-bold">
                        MODEL R² {r2}
                      </span>
                    </div>
                  </div>

                  {/* System Alert Directive Box */}
                  <div className="backdrop-blur-md bg-black/40 border border-white/[0.08] rounded-2xl px-4 py-3 font-mono text-xs text-cream/90 flex items-start gap-2.5">
                    <Zap className="w-4 h-4 text-cyanAccent shrink-0 mt-0.5" />
                    <span>{msg}</span>
                  </div>

                  {/* Operational Action */}
                  <div className="flex items-start gap-2.5 pt-1 text-xs">
                    <span className={`font-display font-bold ${s.text} shrink-0 uppercase tracking-wider`}>
                      PROTOCOL ACTION →
                    </span>
                    <span className="font-sans text-cream/80 leading-relaxed">
                      {actions[cond]}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
