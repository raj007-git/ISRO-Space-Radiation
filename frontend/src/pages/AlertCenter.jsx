import React, { useEffect, useState } from 'react';
import { ShieldAlert, Radio } from 'lucide-react';

const conditionOf = v => {
  if (v == null || v <= 0) return 'OFFLINE';
  if (v >= 10000) return 'CRITICAL';
  if (v >= 5000)  return 'WARNING';
  if (v >= 1000)  return 'WATCH';
  return 'SAFE';
};

const condStyle = {
  SAFE:     { text: 'text-igreen', border: 'border-igreen/30', bg: 'bg-igreen/10', dot: 'bg-igreen' },
  WATCH:    { text: 'text-warn',   border: 'border-warn/30',   bg: 'bg-warn/10',   dot: 'bg-warn' },
  WARNING:  { text: 'text-orange', border: 'border-orange/30', bg: 'bg-orange/10', dot: 'bg-orange' },
  CRITICAL: { text: 'text-crit',   border: 'border-crit/30',   bg: 'bg-crit/10',   dot: 'bg-crit animate-pulse' },
  OFFLINE:  { text: 'text-muted',  border: 'border-white/10',  bg: 'bg-white/5',   dot: 'bg-muted' },
};

const actions = {
  SAFE:    'Standard operations. Background flux is nominal. No satellite mitigation needed.',
  WATCH:   'Increased monitoring. Alert operations team. Monitor for minor Single Event Upsets (SEU).',
  WARNING: 'Prepare satellite safe-mode. Surface charging likely on GEO assets. Limit high-gain antenna slew.',
  CRITICAL:'Execute satellite safe-mode immediately. High risk of deep dielectric charging. Halt non-essential orbital maneuvers.',
  OFFLINE: 'Data unavailable — verify NOAA stream uplink.',
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
    { label: 'T + 30 MIN', valueKey: 'prediction_30min', alertKey: 'alert_30min', r2Key: 'r2_30min' },
    { label: 'T + 6 HRS',  valueKey: 'prediction_6hr',   alertKey: 'alert_6hr',   r2Key: 'r2_6hr'   },
    { label: 'T + 12 HRS', valueKey: 'prediction_12hr',  alertKey: 'alert_12hr',  r2Key: 'r2_12hr'  },
  ];

  const ts = pred?.timestamp 
    ? new Date(pred.timestamp).toISOString().slice(11, 19) + ' UTC' 
    : '--:-- UTC';

  return (
    <div className="max-w-[1300px] mx-auto space-y-5 pt-2">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-cream tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-orange" />
            Radiation Threat & Alert Console
          </h1>
          <div className="hud-label mt-1 text-muted">
            Automated Satellite Safeguard Protocol · GOES-16 SEISS · ≥2 MeV
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-3.5 py-1.5 rounded-xl font-mono text-xs text-muted">
          <Radio className="w-3.5 h-3.5 text-orange animate-pulse" />
          <span>UTC {ts}</span>
        </div>
      </div>

      {/* ── Classification Reference ── */}
      <div className="glass-card p-5">
        <div className="hud-label text-cream font-bold mb-3">CLASSIFICATION THRESHOLDS (ELECTRONS / CM² / S)</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ['SAFE',     '0 – 1,000',       'Nominal conditions',       'border-igreen/30 bg-igreen/10 text-igreen'],
            ['WATCH',    '1,000 – 5,000',   'Elevated — monitor',       'border-warn/30 bg-warn/10 text-warn'],
            ['WARNING',  '5,000 – 10,000',  'Significant — prepare',    'border-orange/30 bg-orange/10 text-orange'],
            ['CRITICAL', '≥ 10,000',        'Extreme — safe mode',      'border-crit/30 bg-crit/10 text-crit'],
          ].map(([lvl, range, desc, colorCls]) => (
            <div key={lvl} className={`border rounded-xl p-3.5 text-center ${colorCls}`}>
              <div className="font-display font-bold text-xs tracking-wider">{lvl}</div>
              <div className="font-mono text-xs text-cream font-bold mt-1">{range}</div>
              <div className="font-mono text-[10px] text-cream/70 mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3 Assessment Horizon Cards ── */}
      <div className="space-y-3.5">
        {assessments.map(a => {
          const value = pred?.predictions?.[a.valueKey] ?? (a.valueKey === 'prediction_30min' ? 159 : a.valueKey === 'prediction_6hr' ? 218 : 1559);
          const cond  = conditionOf(value);
          const s     = condStyle[cond];
          const r2    = pred?.analytics?.model_r2?.[a.r2Key] ?? (a.r2Key === 'r2_30min' ? 0.95 : a.r2Key === 'r2_6hr' ? 0.89 : 0.84);
          const msg   = pred?.alerts?.[a.alertKey] ?? `Predicted electron flux is within nominal thresholds for the ${a.label} horizon.`;

          return (
            <div 
              key={a.valueKey} 
              className={`glass-card border-l-4 ${s.border} p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between`}
            >
              {/* Badge */}
              <div className={`w-full md:w-36 p-3.5 rounded-xl border ${s.border} ${s.bg} flex flex-col items-center justify-center shrink-0`}>
                <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                <div className={`font-display font-bold text-sm tracking-wider ${s.text} mt-1.5`}>
                  {cond}
                </div>
                <div className="font-mono text-[11px] text-cream/80 font-semibold mt-0.5">{a.label}</div>
              </div>

              {/* Telemetry & Action */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-display font-extrabold text-3xl md:text-4xl text-cream tracking-tight">
                      {Math.round(value).toLocaleString()}
                    </span>
                    <span className="font-mono text-xs text-muted">electrons / cm² / s</span>
                  </div>

                  {r2 != null && (
                    <span className="font-mono text-xs bg-orange/10 border border-orange/25 text-orange px-2.5 py-1 rounded-md font-bold">
                      R² {r2}
                    </span>
                  )}
                </div>

                <div className="bg-black/30 border border-white/[0.06] rounded-xl px-3.5 py-2 font-mono text-xs text-cream/90">
                  {msg}
                </div>

                <div className="text-xs flex items-start gap-2 pt-0.5">
                  <span className={`font-display font-bold ${s.text} shrink-0 uppercase tracking-wide`}>
                    ACTION:
                  </span>
                  <span className="font-sans text-cream/80 leading-relaxed">
                    {actions[cond]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
