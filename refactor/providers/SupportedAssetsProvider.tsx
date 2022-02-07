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
	getMinimumStep: (assetId: number) => [number, number];
	findAsset: (assetId: number) => AssetInfo;
};

const SupportedAssetsContext = createContext<ContextProps>({} as ContextProps);

type ProviderProps = {
	assets: Array<AssetInfo>;
};

export default function SupportedAssetsProvider({
	children,
	assets,
}: PropsWithChildren<ProviderProps>) {
	const findAsset = useCallback(
		(assetId: number) => {
			return assets.find((asset) => asset.assetId === assetId);
		},
		[assets]
	);

	const displayAsset = useCallback(
		(assetId: number, value: number) => {
			const asset = findAsset(assetId);
			return [value / Math.pow(10, asset.decimals), asset.symbol] as [
				number,
				string
			];
		},
		[findAsset]
	);

	const getMinimumStep = useCallback(
		(assetId: number) => {
			const asset = findAsset(assetId);

			// By default, we use the `decimals` value to determine minimum step
			let step = 1 / Math.pow(10, asset.decimals),
				scale = 4;

			// In "CENNZ" case, it would be `0.0001` but that would be too small
			switch (asset.symbol) {
				case "CENNZ":
				case "CPAY":
					step = 1;
					scale = 0;
					break;
			}

			return [step, scale] as [number, number];
		},
		[findAsset]
	);

	return (
		<SupportedAssetsContext.Provider
			value={{ assets, displayAsset, getMinimumStep, findAsset }}>
			{children}
		</SupportedAssetsContext.Provider>
	);
}

export function useAssets(): ContextProps {
	return useContext(SupportedAssetsContext);
}
