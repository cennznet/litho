import { NFTListingId } from "@refactor/types";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useCENNZWallet } from "@refactor/providers/CENNZWalletProvider";
import { useCallback } from "react";
import signAndSendTx from "@refactor/utils/signAndSendTx";
import { useDialog } from "@refactor/providers/DialogProvider";
import useGasEstimate from "@refactor/hooks/useGasEstimate";

type Callback = (listingId: NFTListingId) => Promise<string>;

export default function useNFTBuy(): Callback {
	const api = useCENNZApi();
	const { account, wallet } = useCENNZWallet();
	const { showDialog } = useDialog();
	const { confirmSufficientFund } = useGasEstimate();

	return useCallback<Callback>(
		async (listingId) => {
			const extrinsic = api.tx.nft.buy(listingId);
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
					}occurred while processing your request. Please try again.`,
				});
				return "error";
			});
		},
		[api, account?.address, wallet?.signer, showDialog, confirmSufficientFund]
	);
}
