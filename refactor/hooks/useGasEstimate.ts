import { Api } from "@cennznet/api";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useAssets } from "@refactor/providers/SupportedAssetsProvider";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import { AssetInfo } from "@refactor/types";
import { useMemo } from "react";

export default function useGasEstimate(): {
	estimateMintFee: () => Promise<number>;
} {
	const api = useCENNZApi();
	const { account } = useWallet();
	const { findAssetBySymbol } = useAssets();
	const estimateMintFee = useMemo(() => {
		if (!api) return;
		return async () => {
			const cpay = findAssetBySymbol("CPAY");
			const createCollectionFee = await fetchEstimateFee(
				api,
				api.tx.nft.createCollection("Litho (default)", null, null),
				cpay
			);
			const mintSeriesFee = await fetchEstimateFee(
				api,
				api.tx.nft.mintSeries(1, 1, account.address, null, null, null),
				cpay
			);

			return Math.ceil(createCollectionFee + mintSeriesFee);
		};
	}, [api, account, findAssetBySymbol]);

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
