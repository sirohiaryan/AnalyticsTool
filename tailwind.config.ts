import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#161a2a',
        accent: '#8b5cf6',
      },
      boxShadow: {
        glow: '0 8px 30px rgba(139, 92, 246, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
