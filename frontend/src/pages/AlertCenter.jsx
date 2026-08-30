import React, { useEffect, useState } from 'react';

const conditionOf = v => {
  if (v == null || v <= 0) return 'OFFLINE';
  if (v >= 10000) return 'CRITICAL';
  if (v >= 5000)  return 'WARNING';
  if (v >= 1000)  return 'WATCH';
  return 'SAFE';
};

const condStyle = {
  SAFE:     { text: 'text-igreen', border: 'border-igreen', bg: 'bg-igreen/10', dot: 'bg-igreen' },
  WATCH:    { text: 'text-warn',   border: 'border-warn',   bg: 'bg-warn/10',   dot: 'bg-warn' },
  WARNING:  { text: 'text-orange', border: 'border-orange', bg: 'bg-orange/10', dot: 'bg-orange' },
  CRITICAL: { text: 'text-crit',   border: 'border-crit',   bg: 'bg-crit/10',   dot: 'bg-crit animate-pulse' },
  OFFLINE:  { text: 'text-muted',  border: 'border-border', bg: 'bg-surface',   dot: 'bg-muted' },
};

// FIX N-1: Removed "EVA operations" — irrelevant for ISRO unmanned satellite operations.
// FIX M-1: Actions now use same SAFE/WATCH/WARNING/CRITICAL vocabulary as backend.
const actions = {
  SAFE:    'Continue standard operations. No protective action required.',
  WATCH:   'Increase monitoring cadence. Alert satellite operations teams. Minor SEU events possible on vulnerable components.',
  WARNING: 'Prepare spacecraft safe-mode protocols. Reduce high-gain antenna operations. Surface charging effects likely on GEO satellites. Activate anomaly response team.',
  CRITICAL:'Execute satellite safe-mode immediately. Deep dielectric charging risk is high. Halt all non-critical orbital manoeuvres. Maximum asset protection required.',
  OFFLINE: 'Data unavailable — verify uplink status and NOAA feed connectivity.',
};

export default function AlertCenter() {
  const [pred, setPred] = useState(null);

  useEffect(() => {
    fetch('/api/v1/predict').then(r => r.json()).then(setPred).catch(() => {});
  }, []);

  const assessments = [
    { label: 'T + 30 MIN', valueKey: 'prediction_30min', alertKey: 'alert_30min', r2Key: 'r2_30min' },
    { label: 'T + 6 HRS',  valueKey: 'prediction_6hr',   alertKey: 'alert_6hr',   r2Key: 'r2_6hr'   },
    { label: 'T + 12 HRS', valueKey: 'prediction_12hr',  alertKey: 'alert_12hr',  r2Key: 'r2_12hr'  },
  ];

  const ts = pred?.timestamp ? new Date(pred.timestamp).toISOString().slice(11, 19) + ' UTC' : '--:-- UTC';

  return (
    <div className="px-8 py-8 max-w-[1000px] mx-auto space-y-6">
      <div>
        <h1 className="font-display font-black text-3xl text-cream">Mission Alert Console</h1>
        <div className="label mt-1">Automated Threat Assessment Protocol · GOES-16 SEISS · ≥2 MeV</div>
      </div>

      {/* Threshold reference — FIX C-3: unified vocabulary, correct unit */}
      <div className="card p-5">
        <div className="label mb-4">Classification Reference · Electron Flux (electrons / cm² / s at ≥2 MeV)</div>
        <div className="grid grid-cols-4 gap-3">
          {[
            ['SAFE',    '0 – 1,000',        'Quiet conditions'],
            ['WATCH',   '1,000 – 5,000',    'Elevated — monitor'],
            ['WARNING', '5,000 – 10,000',   'Significant — prepare'],
            ['CRITICAL','10,000+',          'Extreme — safe mode'],
          ].map(([lvl, range, desc]) => {
            const s = condStyle[lvl];
            return (
              <div key={lvl} className={`${s.bg} border ${s.border} rounded-xl px-4 py-3 text-center`}>
                <div className={`font-display font-bold text-xs tracking-widest ${s.text}`}>{lvl}</div>
                <div className="font-mono text-[11px] text-muted mt-1">{range}</div>
                <div className="font-mono text-[9px] text-muted/70 mt-0.5">{desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert assessments */}
      <div className="space-y-4">
        {assessments.map(a => {
          const value = pred?.predictions?.[a.valueKey];
          const cond  = conditionOf(value);
          const s     = condStyle[cond];
          // FIX C-2: show R² not fake confidence percentage
          const r2    = pred?.analytics?.model_r2?.[a.r2Key];
          const msg   = pred?.alerts?.[a.alertKey];

          return (
            <div key={a.valueKey} className={`card border-l-4 ${s.border} overflow-hidden`}>
              <div className="p-6 flex gap-6">
                {/* Classification badge */}
                <div className={`${s.bg} rounded-xl w-32 shrink-0 flex flex-col items-center justify-center py-4 gap-1`}>
                  <div className={`w-3 h-3 rounded-full ${s.dot}`}></div>
                  <div className={`font-display font-bold text-sm tracking-widest ${s.text} mt-2`}>{cond}</div>
                  <div className="label text-[9px] mt-1">{a.label}</div>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      {/* FIX C-5: Correct unit */}
                      <div className="label mb-1">Predicted Electron Flux</div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display font-black text-4xl text-cream">
                          {value != null ? Math.round(value).toLocaleString() : '---'}
                        </span>
                        <span className="font-mono text-sm text-muted">electrons / cm² / s</span>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[11px] text-muted space-y-1">
                      <div>{ts}</div>
                      {/* FIX C-2: Show R² label — clear that this is a training metric */}
                      {r2 != null && (
                        <div>Model R²: <span className="text-orange">{r2}</span></div>
                      )}
                    </div>
                  </div>

                  {msg && (
                    <div className="bg-surface border border-border rounded-xl px-4 py-3 font-mono text-xs text-muted">
                      {msg}
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <span className={`font-display text-xs font-bold tracking-wider ${s.text} shrink-0`}>ACTION →</span>
                    <span className="font-sans text-sm text-cream/80">{actions[cond]}</span>
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
