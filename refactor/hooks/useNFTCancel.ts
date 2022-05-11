import { NFTListingId } from "@refactor/types";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useCENNZWallet } from "@refactor/providers/CENNZWalletProvider";
import { useCallback } from "react";
import signAndSendTx from "@refactor/utils/signAndSendTx";
import { useDialog } from "@refactor/providers/DialogProvider";
import useGasEstimate from "@refactor/hooks/useGasEstimate";
import signViaEthWallet from "@refactor/utils/signViaEthWallet";
import { useWalletProvider } from "@refactor/providers/WalletProvider";
import { useMetaMaskWallet } from "@refactor/providers/MetaMaskWalletProvider";
import useSelectedAccount from "@refactor/hooks/useSelectedAccount";
import { useMetaMaskExtension } from "@refactor/providers/MetaMaskExtensionProvider";
import { CENNZnetExtrinsic } from "@cennznet/types/interfaces/extrinsic";

type Callback = (listingId: NFTListingId) => Promise<string>;

export default function useNFTCancel(): Callback {
	const api = useCENNZApi();
	const { wallet } = useCENNZWallet();
	const { extension } = useMetaMaskExtension();
	const { selectedWallet } = useWalletProvider();
	const { selectedAccount: metaMaskAccount } = useMetaMaskWallet();
	const selectedAccount = useSelectedAccount();
	const { showDialog } = useDialog();
	const { confirmSufficientFund } = useGasEstimate();

	return useCallback<Callback>(
		async (listingId) => {
			const extrinsic = api.tx.nft.cancelSale(listingId);
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
					extrinsic as unknown as CENNZnetExtrinsic,
					extension
				).catch(async (error) => {
					await showDialog({
						title: "Oops, something went wrong",
						message: `An error ${
							error?.message ? `(${error.message}) ` : ""
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
