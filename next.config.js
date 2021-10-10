module.exports = {
  headers: [
    { key: "Access-Control-Allow-Origin", value: "*" },
    {
      key: "Access-Control-Allow-Methods",
      value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
    },
  ],
  images: {
    domains: ["", "ipfs.io"],
  },
};
