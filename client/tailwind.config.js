/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jamb: {
          blue: '#0B3B60',
          darkBlue: '#07243C',
          lightBlue: '#EAF3FA',
          green: '#107C41',
          gold: '#D97706',
          danger: '#DC2626',
          gray: '#64748B',
          bg: '#F1F5F9',
          card: '#FFFFFF',
          border: '#CBD5E1'
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['Consolas', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
