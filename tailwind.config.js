/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    './public/index.html',
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        md: '3rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"]
      },
      colors: {
        primary: "#5BCA8E",
        secondary: "#0C66EE",
        blue: "#097EBF",
        lightblue:"#438CC0",
        black: "#222222",
        yellow:"#FFEDBD",
        gray: "#7E7777",
        lightgray: "#DDDDDD",
        green: "#28C165",
        red: "#F4574D",
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
