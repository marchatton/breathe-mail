import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          200: '#93c5fd',
          300: '#60a5fa',
          500: '#2563eb',
          DEFAULT: '#1d4ed8',
          foreground: '#ffffff'
        }
      }
    }
  },
  plugins: []
};

export default config;
