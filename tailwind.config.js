/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mtg-blue': '#0d6efd',
        'mtg-green': '#198754',
        'mtg-red': '#dc3545',
        'mtg-black': '#212529',
        'mtg-white': '#f8f9fa',
        'mtg-gold': '#ffc107',
      }
    },
  },
  plugins: [],
}