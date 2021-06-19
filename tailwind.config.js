const colors = require("tailwindcss/colors");

module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: ["./**/*.html", "./**/*.tsx"],
  theme: {
    colors: {
      ...colors,
      litho: {
        black: "#191B1D",
        cream: "#FBF9F3",
        red: "#D50031",
        blue: "#1F4C7A",
        mustard: "#F1AA3C",
        pink: "#F5BDC2",
        wallet: "rgba(0, 0, 0, 0.12)",
        gray4: "#BDBDBD",
        nft: "#F9F7F1",
      },
    },
    extend: {
      backgroundImage: () => ({
        noise: "url('/Noise.png')",
        grid: "url('/grid.png')",
      }),
      height: {
        customScreen: "calc(100vh - 274px)",
        customScreen2: "calc(100vh - 214px)",
        create: "900px",
      },
      minHeight: {
        create: "900px",
      },
    },
  },
  variants: {},
  plugins: [],
};
