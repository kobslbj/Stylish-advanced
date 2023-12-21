/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      sm: "360px",
      md: "480px",
      lg: "1280px",
      xl: "1920px",
    },
    extend: {
      colors: {
        brown: "#8B572A",
      },
    },
  },
  plugins: [],
};
