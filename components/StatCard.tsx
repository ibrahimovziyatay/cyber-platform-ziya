'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';

export default function StatCard({
  label,
  value,
  total,
  unitLabel,
  accent = false,
  delay = 0
}: {
  label: string;
  value: number;
  total?: number;
  unitLabel?: string;
  accent?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 0.9,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v))
    });
    return () => controls.stop();
  }, [inView, value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay }}
      className="card card-hover !p-5"
    >
      <div className="font-mono text-[11px] text-text-3 mb-2.5">{label}</div>
      <div className={`font-display text-[22px] font-semibold ${accent ? 'text-success' : ''}`}>
        {display}
        {total !== undefined && ` / ${total}`}
        {unitLabel && ` ${unitLabel}`}
      </div>
    </motion.div>
  );
}
