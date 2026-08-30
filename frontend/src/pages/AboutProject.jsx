import React, { useEffect, useState } from 'react';

export default function AboutProject() {
  // FIX M-5: Fetch model_info dynamically from backend so metrics are never stale
  const [modelInfo, setModelInfo] = useState(null);
  useEffect(() => {
    fetch('/api/v1/predict')
      .then(r => r.json())
      .then(d => setModelInfo(d.model_info))
      .catch(() => {});
  }, []);

  // Fallback static values if API is unreachable
  const models = modelInfo
    ? Object.values(modelInfo)
    : [
        { horizon: '30 minutes', r2: 0.95, mae: 326,  features: 37 },
        { horizon: '6 hours',    r2: 0.89, mae: 1042, features: 37 },
        { horizon: '12 hours',   r2: 0.84, mae: 1587, features: 37 },
      ];

  return (
    <div className="px-8 py-8 max-w-[1000px] mx-auto space-y-8 pb-24">
      <div>
        <h1 className="font-display font-black text-3xl text-cream">Mission Briefing</h1>
        <div className="label mt-1">ISRO Space Radiation Forecasting System · Document Rev 1.0</div>
      </div>

      <Sec title="Problem Statement">
        Solar energetic particle (SEP) events and electron radiation storms directly threaten India's orbital assets —
        communication satellites, Earth observation systems, and future crewed missions. Current monitoring
        provides real-time data but <span className="text-orange font-semibold">lacks predictive capability</span>,
        leaving satellite operators with insufficient lead time to execute protective safe-mode manoeuvres.
      </Sec>

      <Sec title="Mission Objective">
        Build a production-grade forecasting system predicting relativistic electron flux at
        {' '}<span className="text-orange font-semibold">three operationally critical horizons</span>{' '}
        — 30 minutes, 6 hours, and 12 hours — using live satellite telemetry and machine learning,
        enabling preemptive protection of national space assets from radiation-induced hardware degradation.
      </Sec>

      <Sec title="Data Sources">
        <div className="grid grid-cols-2 gap-3 mt-3">
          {[
            ['Electron Flux (≥2 MeV)',    'NOAA GOES-16 · SEISS/EPS Instrument'],
            ['Solar Wind Speed',          'NOAA WIND · Solar Wind Plasma'],
            ['Solar Wind Proton Density', 'NOAA WIND · Solar Wind Plasma'],
            ['IMF Bx, By, Bz (GSM)',      'NOAA WIND · Magnetic Field Measurements'],
            ['Update Cadence',            '1-minute native, resampled to 5-minute'],
            ['Coverage Window',           '~24 hours of telemetry history'],
          ].map(([k, v]) => (
            <div key={k} className="bg-surface border border-border rounded-xl px-4 py-3">
              <div className="label text-[10px]">{k}</div>
              <div className="font-sans text-sm text-cream mt-0.5">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-sm text-muted">
          Primary upstream telemetry sources are NOAA GOES-16 and WIND satellite observations. Models are trained using historical telemetry and operate on live NOAA data feeds. The forecasting models use GOES electron flux observations combined with WIND solar wind and interplanetary magnetic field measurements.
        </div>
      </Sec>

      <Sec title="Feature Engineering Pipeline">
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            ['Temporal', 'hour · day · month · day_of_year (4 features)'],
            ['Lag Features', '30-min & 60-min lags for all 7 primary variables (14 features)'],
            ['Rolling Statistics', '1h · 3h · 6h rolling means for Flux, Speed, Density, Bz (12 features)'],
          ].map(([t, d]) => (
            <div key={t} className="bg-surface border border-border rounded-xl p-4">
              <div className="font-display text-xs font-bold text-orange tracking-wider mb-2">{t}</div>
              <div className="font-mono text-[11px] text-muted">{d}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-surface border border-border rounded-xl px-4 py-3 font-mono text-[11px] text-muted">
          <span className="text-orange">Note:</span> The ≥0.8 MeV electron channel is no longer
          available in NOAA's current primary integral-electrons JSON feed. The ≥2 MeV channel
          is used as a conservative proxy. Both channels are mapped into the model's 37-feature
          schema to maintain compatibility with the trained model weights.
        </div>
      </Sec>

      <Sec title="Model Architecture">
        {/* FIX C-4: Correct description — independent regressors, not an ensemble */}
        <p className="text-sm text-muted mb-3">
          Three independent XGBoost Regressors, each trained separately on its own prediction horizon.
          This is <em>not</em> a bagging/boosting ensemble — each model is independently optimised
          for its target time delta using XGBoost's gradient-boosted decision tree algorithm.
        </p>
        <div className="card overflow-hidden mt-3">
          <div className="divide-y divide-border">
            {models.map((m, i) => (
              <div key={i} className="px-5 py-4 flex justify-between items-center">
                <div>
                  <div className="font-display font-bold text-cream text-sm">{m.horizon.toUpperCase()} Forecast</div>
                  {/* FIX C-5: Correct unit in MAE */}
                  <div className="font-mono text-[11px] text-muted mt-0.5">
                    XGBRegressor · 37 features · MAE {Number(m.mae).toLocaleString()} electrons / cm² / s
                  </div>
                </div>
                <div className="flex gap-6 font-mono text-[11px] text-right">
                  <div><div className="label text-[9px]">R²</div><div className="text-orange">{m.r2}</div></div>
                  <div><div className="label text-[9px]">MAE</div><div className="text-cream">{Number(m.mae).toLocaleString()}</div></div>
                  <div><div className="label text-[9px]">Status</div><div className="text-igreen">OPERATIONAL</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Sec>

      <Sec title="System Architecture">
        {/* FIX N-4: Updated to show parallel data inputs, not sequential */}
        <div className="mt-3 font-mono text-[11px] text-muted mb-3">
          GOES-16 and WIND are fetched in parallel. Data streams are independently forward-filled then time-aligned via 5-minute resample before feature engineering.
        </div>
        <div className="flex flex-wrap items-start gap-3 mt-2 font-mono text-[11px]">
          {/* Parallel inputs */}
          <div className="flex flex-col gap-2">
            <ArchNode label="GOES-16" sub="Electron Flux ≥2 MeV" accent={false} />
            <ArchNode label="WIND"  sub="Solar Wind + IMF"      accent={false} />
          </div>
          <span className="text-muted self-center text-lg mt-1">→</span>
          <ArchNode label="NOAA SWPC" sub="JSON REST API (parallel fetch)" accent={true} />
          <span className="text-muted self-center text-lg">→</span>
          <ArchNode label="FastAPI" sub="Feature Engine (5-min resample + lag + roll)" accent={true} />
          <span className="text-muted self-center text-lg">→</span>
          <ArchNode label="XGBoost ×3" sub="30m / 6h / 12h (independent)" accent={true} />
          <span className="text-muted self-center text-lg">→</span>
          <ArchNode label="React MOC" sub="Mission Console" accent={false} />
        </div>
      </Sec>

      <Sec title="Operational Benefits">
        <ul className="space-y-2 text-sm text-cream/80 list-none mt-1">
          <li className="flex gap-2"><span className="text-orange">▸</span> 30-minute forecast enables automated satellite safe-mode activation before particle impact</li>
          <li className="flex gap-2"><span className="text-orange">▸</span> 6-hour forecast supports orbital manoeuvre planning and payload-off scheduling</li>
          <li className="flex gap-2"><span className="text-orange">▸</span> 12-hour outlook aids long-range operations planning and ground-team readiness</li>
          <li className="flex gap-2"><span className="text-orange">▸</span> Reduces risk of deep dielectric charging and single-event upsets (SEU) on GEO assets</li>
          <li className="flex gap-2"><span className="text-orange">▸</span> Eliminates monitoring gaps with continuous automated assessment from live NOAA telemetry</li>
        </ul>
      </Sec>

      {/* SIH Validation */}
      <div className="card border-orange overflow-hidden">
        <div className="bg-orange/10 border-b border-orange px-5 py-3">
          <div className="font-display font-bold text-orange tracking-wider">Technical Validation · Smart India Hackathon</div>
        </div>
        <div className="p-5 grid grid-cols-3 gap-3">
          {[
            ['Data Source',         'Live NOAA GOES-16 + WIND'],
            ['Electron Channel',    '≥2 MeV (SEISS/EPS primary feed)'],
            ['IMF Coordinates',     'GSM (Geocentric Solar Magnetospheric)'],
            ['Feature Count',       '37 engineered features per model'],
            ['Model Type',          'XGBRegressor — 3 independent models'],
            ['Prediction Horizons', '30 min · 6 hr · 12 hr'],
            ['Best R² (test set)',  '0.95 (30-min model)'],
            ['Stack',               'FastAPI + React + XGBoost'],
            ['Pipeline Latency',    '< 2 s end-to-end inference'],
          ].map(([k, v]) => (
            <div key={k} className="bg-surface border border-border rounded-xl px-4 py-3">
              <div className="label text-[9px]">{k}</div>
              <div className="font-sans text-sm text-cream mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sec({ title, children }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-5 bg-orange rounded-full shrink-0"></div>
        <div className="font-display font-bold text-base text-cream">{title}</div>
        <div className="flex-1 h-px bg-border"></div>
      </div>
      <div className="font-sans text-sm text-cream/80 leading-relaxed">{children}</div>
    </div>
  );
}

function ArchNode({ label, sub, accent }) {
  return (
    <div className={`rounded-xl border px-4 py-2 text-center font-mono text-[11px] ${accent ? 'border-orange bg-orange/10' : 'border-border bg-surface'}`}>
      <div className={`font-semibold ${accent ? 'text-orange' : 'text-cream'}`}>{label}</div>
      <div className="text-muted text-[9px] mt-0.5">{sub}</div>
    </div>
  );
}
