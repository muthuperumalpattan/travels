/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#0d9488",
          600: "#0f766e",
          700: "#0f5f59",
          900: "#134e4a",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "Segoe UI", "system-ui", "sans-serif"],
        display: ["Outfit", "Segoe UI", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        ertiga: "url('/images/ertiga-bg.png')",
      },
    },
  },
  plugins: [],
};
