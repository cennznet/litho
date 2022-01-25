import {
	createContext,
	PropsWithChildren,
	useContext,
	useCallback,
} from "react";
import { AssetInfo } from "@refactor/types";

type ContextProps = {
	assets: Array<AssetInfo>;
	displayAsset: (assetId: number, value: number) => [number, string];
};

const SupportedAssetsContext = createContext<ContextProps>({} as ContextProps);

type ProviderProps = {
	assets: Array<AssetInfo>;
};

export default function SupportedAssetsProvider({
	children,
	assets,
}: PropsWithChildren<ProviderProps>) {
	const displayAsset = useCallback(
		(assetId: number, value: number) => {
			const asset = assets.find((asset) => asset.assetId === assetId);
			if (!asset) throw new Error(`Asset "${assetId}" is not found`);

			return [value / Math.pow(10, asset.decimals), asset.symbol] as [
				number,
				string
			];
		},
		[assets]
	);

	return (
		<SupportedAssetsContext.Provider value={{ assets, displayAsset }}>
			{children}
		</SupportedAssetsContext.Provider>
	);
}

export function useAssets(): ContextProps {
	return useContext(SupportedAssetsContext);
}
