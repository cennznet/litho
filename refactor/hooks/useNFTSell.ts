import { NFTListingType, NFTId } from "@refactor/types";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import { useCallback } from "react";

type Callback = (data: SellData) => Promise<string>;

type SellData = {
	type: NFTListingType;
	tokenId: NFTId;
	price: number;
	closingDate: Date;
	paymentAssetId: number;
	buyer?: string;
};

export default function useNFTSell(): Callback {
	const api = useCENNZApi();
	const { account, wallet } = useWallet();

	return useCallback<Callback>(
		async (data: SellData) => {
			const { type, price, closingDate, buyer, tokenId, paymentAssetId } = data;

			const today = [
				"setHours",
				"setMinutes",
				"setSeconds",
				"setMilliseconds",
			].reduce((date, method) => {
				date[method](0);
				return date;
			}, new Date());
			const blockTime = api.consts.babe.expectedBlockTime.toNumber();
			const duration = Math.floor(
				((closingDate.getTime() - today.getTime()) / blockTime) as number
			);

			try {
				const extrinsic =
					type === "Auction"
						? api.tx.nft.auction(tokenId, paymentAssetId, price, duration)
						: api.tx.nft.sell(tokenId, buyer, paymentAssetId, price, duration);

				return await extrinsic
					.signAndSend(account.address, {
						signer: wallet.signer,
					})
					.then((status) => status.toJSON())
					.then(
						(status) =>
							new Promise((resolve) =>
								setTimeout(
									resolve.bind(null, status),
									api.consts.babe.expectedBlockTime.toNumber()
								)
							)
					);
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
