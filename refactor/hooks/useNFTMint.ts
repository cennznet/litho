import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import { NFTCollectionId } from "@refactor/types";
import { useCallback } from "react";
import signAndSendTx from "@refactor/utils/signAndSendTx";
import { useDialog } from "@refactor/providers/DialogProvider";
import useGasEstimate from "@refactor/hooks/useGasEstimate";

type Callback = (
	collectionId: NFTCollectionId,
	metadataPath: string,
	quantity: number,
	royalty: number
) => Promise<string>;

export default function useNFTMint(): Callback {
	const api = useCENNZApi();
	const { account, wallet } = useWallet();
	const { showDialog } = useDialog();
	const { confirmSufficientFund } = useGasEstimate();

	return useCallback<Callback>(
		async (
			collectionId: NFTCollectionId,
			metadataPath: string,
			quantity: number,
			royalty: number
		) => {
			const nextCollectionId = (
				await api.query.nft.nextCollectionId()
			).toJSON() as number;

			const extrinsics = [
				!collectionId
					? api.tx.nft.createCollection("Litho (default)", null)
					: null,
				api.tx.nft.mintSeries(
					collectionId || nextCollectionId,
					quantity,
					account.address,
					{ IpfsDir: metadataPath },
					royalty
						? {
								entitlements: [[account.address, royalty * 10000]],
						  }
						: null
				),
			].filter(Boolean);

			const extrinsic =
				extrinsics.length === 1
					? extrinsics[0]
					: api.tx.utility.batchAll(extrinsics);

			const result = await confirmSufficientFund(extrinsic);
			if (!result) return "cancelled";

			return await signAndSendTx(
				extrinsic,
				account.address,
				wallet.signer
			).catch(async (error) => {
				await showDialog({
					title: "Oops, something went wrong",
					message: `An error ${
						error?.code ? `(#${error.code}) ` : ""
					}occured while minting your NFTs. Please try again.`,
				});
				return "error";
			});
		},
		[api, account?.address, wallet?.signer, showDialog, confirmSufficientFund]
	);
}
