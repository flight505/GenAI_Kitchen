/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "330px",
      },
      colors: {
        'unoform': {
          // Primary - Whites and grays
          'white': '#FAFAFA',
          'gray-50': '#F5F5F5',
          'gray-100': '#EEEEEE',
          'gray-200': '#E0E0E0',
          // Secondary - Wood tones
          'beige-50': '#F5F0E8',
          'beige-100': '#E8DCC6',
          'beige-200': '#D4C4B0',
          'beige-300': '#C0AC9A',
          // Accent - Blacks
          'black': '#1A1A1A',
          'charcoal': '#2C2C2C',
          'gray-dark': '#404040',
          'gray-medium': '#525252',
          // Interactive
          'sage': '#A8B5A0',
          'sage-dark': '#93A08B',
          'sage-darker': '#7E8B76',
          'blue': '#9FAEC0',
          'blue-dark': '#8A9AAD',
          'blue-darker': '#75869A',
        }
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'sans-serif'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        'h1': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        'h2': ['1.875rem', { lineHeight: '1.4', letterSpacing: '-0.015em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@headlessui/tailwindcss")],
};
