'use client';

import { motion } from 'framer-motion';

export default function AmbientGlow() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className="absolute w-[560px] h-[560px] rounded-full bg-accent/[0.10] blur-[120px]"
        animate={{
          x: ['-10%', '8%', '-6%', '-10%'],
          y: ['-15%', '5%', '-8%', '-15%']
        }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '-10%', left: '5%' }}
      />
      <motion.div
        className="absolute w-[460px] h-[460px] rounded-full bg-success/[0.06] blur-[130px]"
        animate={{
          x: ['5%', '-8%', '10%', '5%'],
          y: ['10%', '-6%', '4%', '10%']
        }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '20%', right: '0%' }}
      />
    </div>
  );
}
