import { NFTListingType, NFTId } from "@refactor/types";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useCENNZWallet } from "@refactor/providers/CENNZWalletProvider";
import { useCallback } from "react";
import signAndSendTx from "@refactor/utils/signAndSendTx";
import { useDialog } from "@refactor/providers/DialogProvider";
import useGasEstimate from "@refactor/hooks/useGasEstimate";
import selectByRuntime from "@refactor/utils/selectByRuntime";
import { useWalletProvider } from "@refactor/providers/WalletProvider";
import signViaEthWallet from "@refactor/utils/signViaEthWallet";
import { useMetaMaskWallet } from "@refactor/providers/MetaMaskWalletProvider";
import { useMetaMaskExtension } from "@refactor/providers/MetaMaskExtensionProvider";
import useSelectedAccount from "./useSelectedAccount";

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
	const { extension } = useMetaMaskExtension();
	const { wallet } = useCENNZWallet();
	const { selectedAccount: metaMaskAccount } = useMetaMaskWallet();
	const { selectedWallet } = useWalletProvider();
	const selectedAccount = useSelectedAccount();
	const { showDialog } = useDialog();
	const { confirmSufficientFund } = useGasEstimate();

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
			const blockTime = api.consts.babe.expectedBlockTime.toJSON() as number;
			const duration = Math.floor(
				((closingDate.getTime() - today.getTime()) / blockTime) as number
			);

			const extrinsic = selectByRuntime(api, {
				current: () =>
					type === "Auction"
						? api.tx.nft.auction(tokenId, paymentAssetId, price, duration)
						: api.tx.nft.sell(
								tokenId,
								buyer || null,
								paymentAssetId,
								price,
								duration
						  ),
				cerulean: () =>
					type === "Auction"
						? api.tx.nft.auction(tokenId, paymentAssetId, price, duration, null)
						: api.tx.nft.sell(
								tokenId,
								buyer || null,
								paymentAssetId,
								price,
								duration,
								null
						  ),
			});

			const result = await confirmSufficientFund(extrinsic);
			if (!result) return "cancelled";

			if (selectedWallet === "CENNZnet")
				return await signAndSendTx(
					extrinsic,
					selectedAccount.address,
					wallet.signer
				).catch(async (error) => {
					await showDialog({
						title: "Oops, something went wrong",
						message: `An error ${
							error?.code ? `(#${error.code}) ` : ""
						}occurred while listing your NFT for sale. Please try again.`,
					});
					return "error";
				});

			if (selectedWallet === "MetaMask")
				return await signViaEthWallet(
					api,
					metaMaskAccount.address,
					extrinsic,
					extension
				).catch(async (error) => {
					await showDialog({
						title: "Oops, something went wrong",
						message: `An error ${
							error?.message ? `(#${error.message}) ` : ""
						}occurred while listing your NFT for sale. Please try again.`,
					});
					return "error";
				});
		},
		[
			api,
			selectedAccount?.address,
			wallet?.signer,
			showDialog,
			confirmSufficientFund,
			selectedWallet,
			metaMaskAccount,
			extension,
		]
	);
}
