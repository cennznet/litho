import axios from "axios";

const coinGeckoIds = {
  CENNZ: "centrality",
  ETH: "ethereum",
  USDC: "usd-coin",
  DAI: "dai",
};

function convertToUSD(coinGeckoId, priceToConvert) {
  let conversionRate = "-1";
  const coinGeckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd`;
  return axios.get(coinGeckoUrl).then(function (response) {
    const { data } = response;
    const price = data[coinGeckoId].usd;
    const conversionRateCal = Number(priceToConvert) * price;
    if (!isNaN(conversionRateCal)) {
      conversionRate = conversionRateCal.toFixed(2);
    }
    return conversionRate;
  });
}

export { coinGeckoIds, convertToUSD };
