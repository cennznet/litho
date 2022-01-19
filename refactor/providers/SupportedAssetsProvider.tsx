import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { u8aToString } from "@polkadot/util";

const assetIds =
  process.env.NEXT_PUBLIC_SUPPORTED_ASSETS &&
  process.env.NEXT_PUBLIC_SUPPORTED_ASSETS.split(",");

type AssetInfo = {
  id: number;
  symbol: string;
  decimals: number;
};

const SupportedAssetsContext = createContext<AssetInfo[]>([]);

type ProviderProps = {};

export default function SupportedAssetsProvider({
  children,
}: PropsWithChildren<ProviderProps>) {
  const [supportedAssets, setSupportedAssets] = useState<AssetInfo[]>();
  const cennzApi = useCENNZApi();

  useEffect(() => {
    if (!cennzApi) return;
    async function fetchSupportedAssets() {
      const assets = await (
        cennzApi.rpc as any
      ).genericAsset.registeredAssets();
      if (!assets?.length) return;
      const assetInfos = assetIds.map((assetId) => {
        const [tokenId, { symbol, decimalPlaces }] = assets.find(
          (asset) => asset[0].toString() === assetId
        );
        return {
          id: Number(tokenId),
          symbol: u8aToString(symbol),
          decimals: decimalPlaces.toNumber(),
        };
      });

      setSupportedAssets(assetInfos);
    }

    fetchSupportedAssets();
  }, [cennzApi, setSupportedAssets]);

  return (
    <SupportedAssetsContext.Provider value={supportedAssets}>
      {children}
    </SupportedAssetsContext.Provider>
  );
}

export function useAssetInfos(): Array<AssetInfo> {
  return useContext(SupportedAssetsContext);
}
