/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4da6ff',
          DEFAULT: '#007bff',
          dark: '#0056b3',
        },
        secondary: {
          light: '#ffb366',
          DEFAULT: '#ff8c00',
          dark: '#cc7000',
        },
        dark: '#1f2937',
        light: '#f3f4f6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
