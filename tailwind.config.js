/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontSize:{
        '[14px]':'14px'
      }
    },
  },
  plugins: [],
}

