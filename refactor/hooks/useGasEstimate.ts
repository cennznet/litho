import { Api } from "@cennznet/api";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useAssets } from "@refactor/providers/SupportedAssetsProvider";
import { AssetInfo } from "@refactor/types";
import { useMemo } from "react";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { useDialog } from "@refactor/providers/DialogProvider";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import selectByRuntime from "@refactor/utils/selectByRuntime";

export default function useGasEstimate(): {
	estimateMintFee: () => Promise<number>;
	confirmSufficientFund: (
		extrinsic: SubmittableExtrinsic<"promise", any>
	) => Promise<boolean>;
} {
	const api = useCENNZApi();
	const { findAssetBySymbol } = useAssets();
	const { checkSufficientFund } = useWallet();
	const { showDialog } = useDialog();
	const estimateMintFee = useMemo(() => {
		if (!api) return;
		return async () => {
			const cpay = findAssetBySymbol("CPAY");
			const batch = selectByRuntime(api, {
				current: () =>
					api.tx.utility.batchAll([
						api.tx.nft.createCollection("Litho (default)", null, null),
						api.tx.nft.mintSeries(
							1,
							1,
							"5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM",
							null,
							null,
							null
						),
					]),
				cerulean: () =>
					api.tx.utility.batchAll([
						api.tx.nft.createCollection("Litho (default)", null),
						api.tx.nft.mintSeries(
							1,
							1,
							"5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM",
							null,
							null
						),
					]),
			});

			const fee = await fetchEstimateFee(api, batch, cpay);

			return Math.ceil(fee);
		};
	}, [api, findAssetBySymbol]);

	const confirmSufficientFund = useMemo(() => {
		if (!api) return;

		return async (extrinsic: SubmittableExtrinsic<"promise", any>) => {
			const cpay = findAssetBySymbol("CPAY");
			const fee = await fetchEstimateFee(api, extrinsic, cpay);
			const sufficient = checkSufficientFund(
				fee * Math.pow(10, cpay.decimals),
				cpay.assetId
			);

			if (sufficient) return true;
			await showDialog({
				title: "Insufficient funds",
				message: `You need ${Math.ceil(
					fee
				)} CPAY or more to pay for this gas fee. Please top up your account and try again.`,
			});

			return false;
		};
	}, [api, findAssetBySymbol, checkSufficientFund, showDialog]);

	return { estimateMintFee, confirmSufficientFund };
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
