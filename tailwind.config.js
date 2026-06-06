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
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
