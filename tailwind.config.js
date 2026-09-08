/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "verde-institucional": "#174A1A",
        "amarillo": "#FFD100",
        "fondo": "#D9D9D9",
        "verde-fuerte": "#162A0F",
        "verde-claro": "#E8F2E3",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
