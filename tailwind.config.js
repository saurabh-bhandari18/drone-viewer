/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,html}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f0f1a',
          card: '#1a1a2e',
          border: '#2a2a3e',
          hover: '#2e2e45',
        },
        accent: '#64c8ff',
      },
    },
  },
  plugins: [],
};
