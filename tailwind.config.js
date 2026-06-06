/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        plan: '#2563eb',   // blue — Planned
        actual: '#dc2626', // red — Actual
        eng: '#3b82f6',     // engineering bars
        civil: '#22c55e',   // construction bars
        equip: '#f59e0b',   // equipment bars
        commission: '#f87171',
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      fontSize: {
        xs: ['0.6rem', { lineHeight: '0.8rem' }], 
        sm: ['0.7rem', { lineHeight: '1rem' }],   
        base: ['0.8rem', { lineHeight: '1.2rem' }],
        lg: ['0.9rem', { lineHeight: '1.4rem' }], 
        xl: ['1rem', { lineHeight: '1.4rem' }],   
        '2xl': ['1.2rem', { lineHeight: '1.6rem' }],
        '3xl': ['1.5rem', { lineHeight: '1.8rem' }],
        '4xl': ['1.8rem', { lineHeight: '2rem' }],  
        '5xl': ['2.4rem', { lineHeight: '2.4rem' }],
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
