import { Api } from "@cennznet/api";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useAssets } from "@refactor/providers/SupportedAssetsProvider";
import { AssetInfo } from "@refactor/types";
import { useMemo } from "react";

export default function useGasEstimate(): {
	estimateMintFee: () => Promise<number>;
} {
	const api = useCENNZApi();
	const { findAssetBySymbol } = useAssets();
	const estimateMintFee = useMemo(() => {
		if (!api) return;
		return async () => {
			const cpay = findAssetBySymbol("CPAY");
			const batch = api.tx.utility.batchAll([
				api.tx.nft.createCollection("Litho (default)", null, null),
				api.tx.nft.mintSeries(
					1,
					1,
					"5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM",
					null,
					null,
					null
				),
			]);
			const fee = await fetchEstimateFee(api, batch, cpay);

			return Math.ceil(fee);
		};
	}, [api, findAssetBySymbol]);

	return { estimateMintFee };
}

export async function fetchEstimateFee(
	api: Api,
	extrinsic: any,
	asset: AssetInfo
): Promise<number> {
	const fee = await api.derive.fees.estimateFee({
		extrinsic,
		userFeeAssetId: asset.assetId,
	} as any);

	return (fee as any).toNumber() / Math.pow(10, asset.decimals);
}
