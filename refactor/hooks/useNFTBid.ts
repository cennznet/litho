import { NFTListingId } from "@refactor/types";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import { useCallback } from "react";

type Callback = (listingId: NFTListingId, amount: number) => Promise<string>;

export default function useNFTBid(): Callback {
	const api = useCENNZApi();
	const { account, wallet } = useWallet();

	return useCallback<Callback>(
		async (listingId, amount) => {
			try {
				const extrinsic = api.tx.nft.bid(listingId, amount);
				return await extrinsic
					.signAndSend(account.address, {
						signer: wallet.signer,
					})
					.then((status) => status.toJSON());
			} catch (error) {
				if (error?.message === "Cancelled") return "cancelled";
				console.log(error?.message);
				console.log(`Transaction Error: ${error}`);
				alert(error?.message);
			}
		},
		[api, account?.address, wallet?.signer]
	);
}
