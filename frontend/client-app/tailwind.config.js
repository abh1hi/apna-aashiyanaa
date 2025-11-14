/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF', // iOS Blue
        'primary-variant': '#0056b3',
        'primary-container': '#cce5ff',
        'on-primary': '#ffffff',
        'on-primary-container': '#00224d',
        secondary: '#8E8E93', // iOS Gray
        'secondary-container': '#e5e5ea',
        'on-secondary': '#000000',
        'on-secondary-container': '#3d3d40',
        'tertiary-container': '#ffebcc',
        'on-tertiary-container': '#b36b00',
        accent: '#FF9500', // iOS Orange
        'on-accent': '#ffffff',
        background: '#F2F2F7', // iOS Background
        surface: '#FFFFFF', // iOS Surface
        'surface-variant': '#E5E5EA',
        'surface-container-highest': '#dcdce0',
        'on-background': '#000000',
        'on-surface': '#000000',
        'on-surface-variant': '#3d3d40',
        outline: '#DCDCDC', // iOS Separator
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
      boxShadow: {
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}