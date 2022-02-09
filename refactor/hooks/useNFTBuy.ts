import { NFTListingId } from "@refactor/types";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import { useCallback } from "react";
import signAndSendTx from "@refactor/utils/signAndSendTx";

type Callback = (listingId: NFTListingId) => Promise<string>;

export default function useNFTBuy(): Callback {
	const api = useCENNZApi();
	const { account, wallet } = useWallet();

	return useCallback<Callback>(
		async (listingId) => {
			const extrinsic = api.tx.nft.buy(listingId);
			return await signAndSendTx(extrinsic, account.address, wallet.signer);
		},
		[api, account?.address, wallet?.signer]
	);
}
