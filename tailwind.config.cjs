/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'weather-1': '#0ea5a4',
        'weather-2': '#06b6d4'
      }
    }
  },
  plugins: []
};
