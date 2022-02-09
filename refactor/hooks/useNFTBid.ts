import { NFTListingId } from "@refactor/types";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import { useCallback } from "react";
import signAndSendTx from "@refactor/utils/signAndSendTx";

type Callback = (listingId: NFTListingId, amount: number) => Promise<string>;

export default function useNFTBid(): Callback {
	const api = useCENNZApi();
	const { account, wallet } = useWallet();

	return useCallback<Callback>(
		async (listingId, amount) => {
			const extrinsic = api.tx.nft.bid(listingId, amount);
			return await signAndSendTx(
				extrinsic,
				account.address,
				wallet.signer,
				api.consts.babe.expectedBlockTime.toNumber()
			);
		},
		[api, account?.address, wallet?.signer]
	);
}
