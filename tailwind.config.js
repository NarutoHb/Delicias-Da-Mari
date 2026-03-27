/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF85A2",
        secondary: "#FFF5F7",
        accent: "#6D4C41",
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '40px',
      },
    },
  },
  plugins: [],
}
