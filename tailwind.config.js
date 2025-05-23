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
          // Official Unoform Brand Colors
          'cream': '#F2F2E5',
          'black': '#000000',
          'gray': '#999999',
          'gray-dark': '#4C4C4C',
          'gray-medium': '#72727F',
          'gold': '#C19A5B',
          'gold-dark': '#AD8850',
          'dark-brown': '#262619',
          'gray-light': '#CCCCCC',
          'red': '#D8594C',
          // Legacy mappings for compatibility
          'white': '#FFFFFF',
          'beige-50': '#F2F2E5',
          'beige-100': '#F2F2E5',
          'beige-200': '#F2F2E5',
          'sage': '#CCA572',
          'sage-dark': '#B8956A',
          'sage-darker': '#A17E5A',
          'charcoal': '#262619',
          'gray-50': '#F2F2E5',
          'gray-100': '#CCCCCC',
          'gray-200': '#999999',
        }
      },
      fontFamily: {
        'sans': ['Work Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'sans-serif'],
      },
      fontWeight: {
        'extralight': '200',
        'light': '300',
        'normal': '400',
        'medium': '500',
      },
      fontSize: {
        'display-lg': ['82px', { lineHeight: '86px', letterSpacing: '-1.5px', fontWeight: '200' }],
        'display': ['42px', { lineHeight: '48px', letterSpacing: '-1.5px', fontWeight: '200' }],
        'display-mobile': ['30px', { lineHeight: '36px', letterSpacing: '-1.5px', fontWeight: '200' }],
        'h1': ['46px', { lineHeight: '56px', letterSpacing: '-0.6px', fontWeight: '300' }],
        'h1-mobile': ['30px', { lineHeight: '36px', letterSpacing: '-0.6px', fontWeight: '300' }],
        'body': ['14px', { lineHeight: '20px', letterSpacing: '0px', fontWeight: '400' }],
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
