import React, { useContext, useEffect, useState } from "react";
import type { AssetInfo } from "@cennznet/types/interfaces/genericAsset";
import Web3Context from "./Web3Context";
import { bnToBn, extractTime } from "@polkadot/util";

const SupportedAssetsContext = React.createContext({
  supportedAssets: [],
});

const SupportedAssetIds = [16000, 16001];

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
        const supportedAssets =
          await web3Context.api.query.genericAsset.assetMeta.multi(
            SupportedAssetIds
          );
        const assetInfo = supportedAssets.map((asset, index) => {
          const id = SupportedAssetIds[index];
          const decimals = asset.decimalPlaces.toNumber();
          const symbol = asset.symbol.toUtf8();
          return { id, symbol, decimals };
        });
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

export function useSupportedAssets() {
  return useContext(SupportedAssetsContext);
}

export default SupportedAssetsProvider;
