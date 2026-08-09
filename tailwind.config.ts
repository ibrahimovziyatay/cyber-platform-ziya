import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#080b14',
        panel: '#0e1420',
        'panel-2': '#121a2b',
        border: '#1d283d',
        'border-soft': '#161f31',
        text: {
          1: '#e8edf6',
          2: '#8b99b3',
          3: '#546076'
        },
        accent: {
          DEFAULT: '#4c82f7',
          2: '#7aa4ff',
          soft: 'rgba(76,130,247,0.10)',
          'soft-2': 'rgba(76,130,247,0.22)'
        },
        success: {
          DEFAULT: '#35c48c',
          soft: 'rgba(53,196,140,0.10)'
        },
        danger: '#f2555a'
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'monospace']
      },
      borderRadius: {
        DEFAULT: '10px'
      }
    }
  },
  plugins: []
};

export default config;
