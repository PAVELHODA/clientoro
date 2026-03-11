/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      backgroundImage: {
        // INSPIRE světelný highlight – diagonální, perleťový, 60 %
        "inspire-highlight": `linear-gradient(
          -22deg,
          #faf7ff 0%,
          rgba(250, 247, 255, 0.85) 10%,
          rgba(250, 247, 255, 0.45) 30%,
          rgba(250, 247, 255, 0.15) 50%,
          rgba(250, 247, 255, 0) 60%
        )`,
      },

      maskImage: {
        // Jemná elipsa – širší, lehce vyšší, posun zleva
        "inspire-ellipse": `radial-gradient(
          ellipse 120% 55% at 20% 0%,
          white 0%,
          transparent 100%
        )`,
      },
    },
  },

  plugins: [
    function ({ addUtilities, theme }) {
      addUtilities({
        ".bg-inspire-highlight": {
          backgroundImage: theme("backgroundImage.inspire-highlight"),
          WebkitMaskImage: theme("maskImage.inspire-ellipse"),
          maskImage: theme("maskImage.inspire-ellipse"),
        },
      });
    },
  ],
};
