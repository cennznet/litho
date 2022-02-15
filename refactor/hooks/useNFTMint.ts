import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import { NFTCollectionId } from "@refactor/types";
import { useCallback } from "react";
import signAndSendTx from "@refactor/utils/signAndSendTx";

type Callback = (
	collectionId: NFTCollectionId,
	metadataPath: string,
	quantity: number,
	royalty: number
) => Promise<string>;

export default function useNFTMint(): Callback {
	const api = useCENNZApi();
	const { account, wallet } = useWallet();

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
					? api.tx.nft.createCollection("Litho (default)", null, null)
					: null,
				api.tx.nft.mintSeries(
					collectionId || nextCollectionId,
					quantity,
					account.address,
					null,
					metadataPath,
					royalty
						? {
								entitlements: [[account.address, royalty * 10000]],
						  }
						: null
				),
			].filter(Boolean);

			return await signAndSendTx(
				extrinsics.length === 1
					? extrinsics[0]
					: api.tx.utility.batchAll(extrinsics),
				account.address,
				wallet.signer
			);
		},
		[api, account?.address, wallet?.signer]
	);
}
