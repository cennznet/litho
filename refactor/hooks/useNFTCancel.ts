import { NFTListingId } from "@refactor/types";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import { useCallback } from "react";

type Callback = (listingId: NFTListingId) => Promise<string>;

export default function useNFTCancel(): Callback {
	const api = useCENNZApi();
	const { account, wallet } = useWallet();

	return useCallback<Callback>(
		async (listingId) => {
			try {
				const extrinsic = api.tx.nft.cancelSale(listingId);
				return await extrinsic
					.signAndSend(account.address, {
						signer: wallet.signer,
					})
					.then((status) => status.toJSON());
			} catch (error) {
				if (error?.message === "Cancelled") return;
				console.log(error?.message);
				console.log(`Transaction Error: ${error}`);
				alert(error?.message);
			}
		},
		[api, account?.address, wallet?.signer]
	);
}
