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
    fontFamily: {
      sans: ["serenity", "sans-serif"],
    },
    extend: {
      backgroundImage: () => ({
        noise: "url('/Noise.png')",
        grid: "url('/grid.png')",
        "image-loading": "url('/image-loading.jpg')",
      }),
      height: {
        customScreen: "calc(100vh - 274px)",
      },
      minHeight: {
        customScreen2: "calc(100vh - 354px)",
        create: "900px",
      },
      zIndex: {
        "-10": "-10",
      },
    },
  },
  variants: {},
  plugins: [],
};
