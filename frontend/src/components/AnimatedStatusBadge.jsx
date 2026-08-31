import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated badge indicating mission status.
 * Props:
 *   - status: 'SAFE' | 'WATCH' | 'WARNING' | 'CRITICAL'
 *   - size: string (Tailwind height/width, default 'h-3 w-3')
 */
export default function AnimatedStatusBadge({ status = 'SAFE', size = 'h-3 w-3' }) {
  const bgClass = {
    SAFE: 'bg-igreen',
    WATCH: 'bg-warn',
    WARNING: 'bg-orange',
    CRITICAL: 'bg-crit',
  }[status] || 'bg-muted';

  const animate = status !== 'SAFE' ? { opacity: [0.5, 1, 0.5] } : {};

  return (
    <motion.div
      className={`rounded-full ${bgClass} ${size}`}
      animate={animate}
      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
    />
  );
}
