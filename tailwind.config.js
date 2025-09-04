/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
    colors: {
      primary: {
        500: '#ff4500',
        600: '#e03d00',
      },
    },
    },
  },
  plugins: [],
}
