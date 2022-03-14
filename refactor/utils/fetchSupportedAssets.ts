import { Api } from "@cennznet/api";
import { AssetInfo } from "@refactor/types";
import { u8aToString } from "@polkadot/util";
import { SUPPORTED_ASSET_IDS } from "@refactor/constants";

export default async function fetchSupportedAssets(
	api: Api
): Promise<Array<AssetInfo>> {
	const assets = await (api.rpc as any).genericAsset.registeredAssets();
	if (!assets?.length) return [];

	return SUPPORTED_ASSET_IDS.map((assetId) => {
		const [tokenId, { symbol, decimalPlaces }] = assets.find((asset) => {
			return asset[0].toNumber() === assetId;
		});

		return {
			assetId: Number(tokenId),
			symbol: u8aToString(symbol),
			decimals: decimalPlaces.toNumber(),
		};
	});
}
