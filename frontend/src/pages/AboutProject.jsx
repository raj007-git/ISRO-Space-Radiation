import React, { useEffect, useState } from 'react';
import { FileText, Database, Cpu, Satellite, Award } from 'lucide-react';

export default function AboutProject() {
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    fetch('/api/v1/predict')
      .then(r => r.json())
      .then(d => setModelInfo(d.model_info))
      .catch(() => {});
  }, []);

  const models = modelInfo
    ? Object.values(modelInfo)
    : [
        { horizon: '30 minutes', r2: 0.95, mae: 326,  features: 37 },
        { horizon: '6 hours',    r2: 0.89, mae: 1042, features: 37 },
        { horizon: '12 hours',   r2: 0.84, mae: 1587, features: 37 },
      ];

  return (
    <div className="max-w-[1300px] mx-auto space-y-6 pt-2 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-cream tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-orange" />
            Mission Briefing
          </h1>
          <div className="hud-label mt-1 text-muted">
            ISRO Space Radiation Forecasting System · Technical Specification
          </div>
        </div>
      </div>

      {/* ── Problem & Objective ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-2">
          <div className="hud-label text-orange font-bold">OPERATIONAL PROBLEM</div>
          <p className="text-sm text-cream/85 leading-relaxed">
            Relativistic electron storms (≥2 MeV) directly degrade satellite solar panels and cause deep dielectric charging in GEO orbital assets. Real-time telemetry lacks predictive lead time required to execute protective safe-mode maneuvers.
          </p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="hud-label text-cyanAccent font-bold">MISSION OBJECTIVE</div>
          <p className="text-sm text-cream/85 leading-relaxed">
            Provide automated, multi-horizon forecasts (<strong className="text-cream">30 min, 6 hr, 12 hr</strong>) of relativistic electron flux using live satellite data to preemptively protect satellite avionics and communications.
          </p>
        </div>
      </div>

      {/* ── Live Telemetry Sources ── */}
      <div className="glass-card p-5 space-y-3">
        <div className="hud-label text-cream font-bold flex items-center gap-2">
          <Database className="w-4 h-4 text-orange" />
          UPSTREAM TELEMETRY FEEDS
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {[
            ['Electron Flux (≥2 MeV)',    'NOAA GOES-16 · SEISS', 'GEOSTATIONARY'],
            ['Solar Wind Velocity',       'NOAA WIND · SWE',      'LAGRANGE L1'],
            ['Proton Density',            'NOAA WIND · SWE',      'LAGRANGE L1'],
            ['IMF Bx, By, Bz (GSM)',      'NOAA WIND · MFI',      'MAGNETIC FIELD'],
          ].map(([k, v, orbit]) => (
            <div key={k} className="bg-black/30 border border-white/[0.06] rounded-xl p-3.5 space-y-1">
              <div className="text-[10px] text-muted">{k}</div>
              <div className="font-semibold text-cream">{v}</div>
              <div className="text-[9px] text-orange">{orbit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Model Architecture ── */}
      <div className="glass-card p-5 space-y-3">
        <div className="hud-label text-cream font-bold flex items-center gap-2">
          <Cpu className="w-4 h-4 text-orange" />
          MACHINE LEARNING MODELS (XGBOOST REGRESSORS)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {models.map((m, idx) => (
            <div key={idx} className="bg-black/30 border border-white/[0.06] rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-display font-bold text-sm text-cream">{m.horizon.toUpperCase()} FORECAST</span>
                <span className="font-mono text-[9px] bg-igreen/10 text-igreen border border-igreen/25 px-2 py-0.5 rounded-full font-bold">
                  OPERATIONAL
                </span>
              </div>
              <div className="font-mono text-xs space-y-1 pt-1 text-muted">
                <div className="flex justify-between">
                  <span>R² Score:</span>
                  <strong className="text-orange">{m.r2}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Test MAE:</span>
                  <strong className="text-cream">{Number(m.mae).toLocaleString()} electrons/cm²/s</strong>
                </div>
                <div className="flex justify-between">
                  <span>Engineered Features:</span>
                  <strong className="text-cream">{m.features || 37}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── System Pipeline ── */}
      <div className="glass-card p-5 space-y-3">
        <div className="hud-label text-cream font-bold flex items-center gap-2">
          <Satellite className="w-4 h-4 text-orange" />
          DATA FLOW ARCHITECTURE
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 font-mono text-xs pt-1">
          <Pill label="GOES-16 & WIND Feeds" />
          <span className="text-muted">→</span>
          <Pill label="FastAPI Feature Engine (37 Features)" accent />
          <span className="text-muted">→</span>
          <Pill label="XGBoost Models (3 Horizons)" accent />
          <span className="text-muted">→</span>
          <Pill label="ISRO Mission Control Dashboard" />
        </div>
      </div>

      {/* ── Technical Highlights ── */}
      <div className="glass-card p-5 space-y-3">
        <div className="font-display font-bold text-sm text-orange flex items-center gap-2">
          <Award className="w-4 h-4 text-orange" />
          SMART INDIA HACKATHON · VALIDATION SUMMARY
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          {[
            ['DATA SOURCES', 'NOAA GOES-16 & WIND'],
            ['RADIATION CHANNEL', '≥2 MeV Relativistic Electrons'],
            ['PIPELINE LATENCY', '< 1.5 Seconds'],
            ['BEST TEST R²', '0.95 (30-Minute Model)'],
          ].map(([k, v]) => (
            <div key={k} className="bg-black/30 border border-white/[0.06] rounded-xl p-3">
              <div className="text-[9px] text-muted">{k}</div>
              <div className="font-semibold text-cream mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function Pill({ label, accent }) {
  return (
    <div className={`px-3.5 py-2 rounded-xl border text-center ${
      accent 
        ? 'bg-orange/10 border-orange/30 text-orange font-semibold' 
        : 'bg-white/[0.04] border-white/10 text-cream'
    }`}>
      {label}
    </div>
  );
}
