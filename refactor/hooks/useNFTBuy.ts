import { NFTListingId } from "@refactor/types";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import { useCallback } from "react";
import signAndSendTx from "@refactor/utils/signAndSendTx";
import { useDialog } from "@refactor/providers/DialogProvider";

type Callback = (listingId: NFTListingId) => Promise<string>;

export default function useNFTBuy(): Callback {
	const api = useCENNZApi();
	const { account, wallet } = useWallet();
	const { showDialog } = useDialog();

	return useCallback<Callback>(
		async (listingId) => {
			const extrinsic = api.tx.nft.buy(listingId);
			return await signAndSendTx(
				extrinsic,
				account.address,
				wallet.signer
			).catch(async (error) => {
				await showDialog({
					title: "Oops, something went wrong",
					message: `An error ${
						error?.code ? `(#${error.code}) ` : ""
					}occured while processing your request. Please try again.`,
				});
				return "error";
			});
		},
		[api, account?.address, wallet?.signer, showDialog]
	);
}
