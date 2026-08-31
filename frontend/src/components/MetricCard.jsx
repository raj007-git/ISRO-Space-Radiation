import React from 'react';
import { motion } from 'framer-motion';

/**
 * Glass‑styled metric card with optional trend arrow and risk level colour.
 * Props:
 *   - title: string – metric label
 *   - value: string | number – displayed value
 *   - unit: string – unit suffix (optional)
 *   - trend: 'up' | 'down' | null – direction arrow
 *   - risk: 'SAFE' | 'WATCH' | 'WARNING' | 'CRITICAL' – risk level for colour coding
 */
export default function MetricCard({ title, value, unit = '', trend = null, risk = 'SAFE' }) {
  const riskColor = {
    SAFE: 'text-igreen',
    WATCH: 'text-warn',
    WARNING: 'text-orange',
    CRITICAL: 'text-crit',
  }[risk] || 'text-muted';

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
      whileHover={{ scale: 1.03 }}
      className="card bg-panel bg-opacity-30 backdrop-blur-md border border-border rounded-xl p-4 text-center transition-shadow"
    >
      <div className="label mb-2 text-sm uppercase text-muted">{title}</div>
      <div className={`font-display font-black text-4xl ${riskColor}`}> {value}<span className="font-mono text-base ml-1">{unit}</span> <TrendIcon direction={trend} /></div>
    </motion.div>
  );
}
