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
      transparent: "transparent",
      litho: {
        black: "#191B1D",
        cream: "#FBF9F3",
        red: "#D50031",
        blue: "#1B019A",
        mustard: "#F1AA3C",
        pink: "#F5BDC2",
        wallet: "rgba(0, 0, 0, 0.12)",
        gray4: "#BDBDBD",
        nft: "#F9F7F1",
      },
    },
    fontFamily: {
      sans: ["quasimoda", "sans-serif"],
    },
    extend: {
      backgroundImage: () => ({
        noise: "url('/Noise.png')",
        grid: "url('/grid.png')",
        "image-loading": "url('/image-loading.jpg')",
        "home-1": "url('/bg-home-1.png')",
        "home-2": "url('/bg-home-2.png')",
      }),
      height: {
        customScreen: "calc(100vh - 274px)",
      },
      minHeight: {
        customScreen2: "calc(100vh - 354px)",
        create: "900px",
        "litho-app": "648px",
        "litho-body": "598px",
      },
      zIndex: {
        "-10": "-10",
      },
    },
  },
  variants: {},
  plugins: [],
};
