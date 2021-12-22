import React, { useEffect, useState } from "react";
import Web3Context from "./Web3Context";
import SupportedAssetsContext from "./SupportedAssetsContext";
import { u8aToString } from "@polkadot/util";

const SupportedAssetIds =
  process.env.NEXT_PUBLIC_SUPPORTED_ASSETS &&
  process.env.NEXT_PUBLIC_SUPPORTED_ASSETS.split(",");

const tokenLogoURLs = {
  CENNZ: "/cennznet-logo.svg",
  CPAY: "/cpay-logo.svg",
  cUSD: "/cusd-logo.svg",
  ETH: "/ethereum-logo.svg",
  DAI: "/dai-logo.svg",
  USDC: "/usdc-logo.svg",
};

export type SupportedAssetInfo = {
  id: number;
  symbol: string;
  decimals: number;
  logoURL: string;
};

const SupportedAssetsProvider = ({ children }) => {
  const web3Context = React.useContext(Web3Context);
  const [supportedAssets, setSupportedAssets] =
    useState<SupportedAssetInfo[]>();

  useEffect(() => {
    if (!web3Context.api) {
      return;
    }

    async function fetchSupportedAssets() {
      web3Context.api.isReady.then(async () => {
        const assets =
          await web3Context.api.rpc.genericAsset.registeredAssets();

        let assetInfo = [];
        if (SupportedAssetIds && SupportedAssetIds.length > 0) {
          assetInfo = SupportedAssetIds.map((assetId) => {
            const [tokenId, { symbol, decimalPlaces }] = assets.find(
              (asset) => asset[0].toString() === assetId
            );
            return {
              id: Number(tokenId),
              symbol: u8aToString(symbol),
              decimals: decimalPlaces.toNumber(),
              logoURL: tokenLogoURLs[u8aToString(symbol)],
            };
          });
        } else {
          assetInfo = assets.map((asset) => {
            const [tokenId, { symbol, decimalPlaces }] = asset;
            return {
              id: tokenId.toString(),
              symbol: u8aToString(symbol),
              decimals: decimalPlaces.toNumber(),
              logoURL: tokenLogoURLs[symbol],
            };
          });
        }
        setSupportedAssets(assetInfo);
      });
    }
    fetchSupportedAssets();
  });

  return (
    <SupportedAssetsContext.Provider value={{ supportedAssets }}>
      {children}
    </SupportedAssetsContext.Provider>
  );
};

export default SupportedAssetsProvider;
