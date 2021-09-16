import React, { useEffect, useState } from "react";
import Web3Context from "./Web3Context";
import SupportedAssetsContext from "./SupportedAssetsContext";

const SupportedAssetIds =
  process.env.NEXT_PUBLIC_SUPPORTED_ASSETS &&
  process.env.NEXT_PUBLIC_SUPPORTED_ASSETS.split(" ");

export type SupportedAssetInfo = {
  id: number;
  symbol: string;
  decimals: number;
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
              (asset) => asset[0].toNumber() === +assetId
            );
            return {
              id: tokenId.toNumber(),
              symbol: symbol.toUtf8(),
              decimals: decimalPlaces.toNumber(),
            };
          });
        } else {
          assetInfo = assets.map((asset) => {
            const [tokenId, { symbol, decimalPlaces }] = asset;
            return {
              id: tokenId.toNumber(),
              symbol: symbol.toUtf8(),
              decimals: decimalPlaces.toNumber(),
            };
          });
        }
        setSupportedAssets(assetInfo);
      });
    }
    fetchSupportedAssets();
  }, []);

  return (
    <SupportedAssetsContext.Provider value={{ supportedAssets }}>
      {children}
    </SupportedAssetsContext.Provider>
  );
};

export default SupportedAssetsProvider;
