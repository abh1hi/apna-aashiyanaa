// File: frontend/client/tailwind.config.cjs

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
   theme: {
     extend: {
       colors: {
        gold: '#FFD700',
        'primary': '#1a1a1a', // Dark, almost black
        'secondary': '#ffffff', // White
        'accent': '#c5a47e', // Muted Gold
        'neutral': '#f5f5f5', // Light Gray
       },
      fontFamily: {
        'serif': ['"Playfair Display"', 'serif'],
        'sans': ['"Lato"', 'sans-serif'],
       },
     },
    },
  plugins: [],
 };