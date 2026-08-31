import React from 'react';
import { motion } from 'framer-motion';

/**
 * Panel showing a forecast prediction.
 * Props:
 *   - label: string – e.g. "T + 30 MIN"
 *   - value: number | null – prediction value
 *   - unit: string – unit suffix (optional)
 *   - risk: 'SAFE' | 'WATCH' | 'WARNING' | 'CRITICAL' – risk level for colour
 *   - confidence: number | null – confidence score (0‑1)
 *   - trend: 'up' | 'down' | null – arrow indicating trend direction
 */
export default function PredictionPanel({ label, value, unit = '', risk = 'SAFE', confidence = null, trend = null }) {
  const riskColor = {
    SAFE: 'text-igreen',
    WATCH: 'text-warn',
    WARNING: 'text-orange',
    CRITICAL: 'text-crit',
  }[risk] || 'text-muted';

  const ConfidenceBadge = ({ score }) => {
    if (score == null) return null;
    const pct = Math.round(score * 100);
    return (
      <div className="text-xs font-mono bg-panel bg-opacity-40 px-2 py-0.5 rounded-full mt-1 text-muted">
        {pct}%
      </div>
    );
  };

  const TrendIcon = ({ direction }) => {
    if (!direction) return null;
    return direction === 'up' ? (
      <svg className="w-4 h-4 inline-block fill-current text-green-500" viewBox="0 0 24 24"><path d="M4 12l8-8 8 8H4z"/></svg>
    ) : (
      <svg className="w-4 h-4 inline-block fill-current text-red-500" viewBox="0 0 24 24"><path d="M20 12l-8 8-8-8h16z"/></svg>
    );
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="card bg-panel bg-opacity-30 backdrop-blur-md border border-border rounded-xl p-4 text-center transition-shadow"
    >
      <div className="label mb-1 text-sm uppercase text-muted">{label}</div>
      <div className={`font-display font-black text-3xl ${riskColor}`}> 
        {value != null ? value : '---'}
        <span className="font-mono text-base ml-1">{unit}</span>
        <TrendIcon direction={trend} />
      </div>
      <ConfidenceBadge score={confidence} />
    </motion.div>
  );
}
