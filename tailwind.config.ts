import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Map slate to custom names
        'bg-primary': '#020617',    // slate-950
        'bg-secondary': '#0f172a',  // slate-900
        'bg-tertiary': '#1e293b',   // slate-800
        'border-primary': '#1e293b', // slate-800
        'border-secondary': '#0f172a', // slate-900
        'text-primary': '#f8fafc',  // slate-50
        'text-secondary': '#cbd5e1', // slate-300
        'text-muted': '#94a3b8',    // slate-400
        'text-dim': '#64748b',      // slate-500
        'text-subtle': '#475569',   // slate-600
        'text-faint': '#334155',    // slate-700
        'accent-primary': '#8b5cf6', // violet-500
        'accent-secondary': '#a78bfa', // violet-400
        'accent-pink': '#ec4899',   // pink-500
        'success': '#10b981',       // emerald-500
        'danger': '#ef4444',        // red-500
      },
    },
  },
  plugins: [],
};

export default config;
