import { Api } from "@cennznet/api";
import { AssetInfo } from "@refactor/types";
import { u8aToString } from "@polkadot/util";

const assetIds =
	process.env.NEXT_PUBLIC_SUPPORTED_ASSETS &&
	process.env.NEXT_PUBLIC_SUPPORTED_ASSETS.split(",");

export default async function fetchSupportedAssets(
	api: Api
): Promise<Array<AssetInfo>> {
	const assets = await (api.rpc as any).genericAsset.registeredAssets();
	if (!assets?.length) return [];
	return assetIds.map((assetId) => {
		const [tokenId, { symbol, decimalPlaces }] = assets.find((asset) => {
			return asset[0].toString() === assetId;
		});

		return {
			assetId: Number(tokenId),
			symbol: u8aToString(symbol),
			decimals: decimalPlaces.toNumber(),
		};
	});
}
