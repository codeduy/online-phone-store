/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}', 
  ],
  theme: {
    extend: {
      minWidth: {
        'page': '1280px',
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          DEFAULT: '1280px',
        },
      },
    },
  },
  plugins: [],
}