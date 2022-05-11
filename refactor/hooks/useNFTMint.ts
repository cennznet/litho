import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useCENNZWallet } from "@refactor/providers/CENNZWalletProvider";
import { NFTCollectionId } from "@refactor/types";
import { useCallback } from "react";
import signAndSendTx from "@refactor/utils/signAndSendTx";
import { useDialog } from "@refactor/providers/DialogProvider";
import useGasEstimate from "@refactor/hooks/useGasEstimate";
import isFinite from "lodash/isFinite";
import selectByRuntime from "@refactor/utils/selectByRuntime";
import signViaEthWallet from "@refactor/utils/signViaEthWallet";
import { useMetaMaskExtension } from "@refactor/providers/MetaMaskExtensionProvider";
import { useMetaMaskWallet } from "@refactor/providers/MetaMaskWalletProvider";
import { useWalletProvider } from "@refactor/providers/WalletProvider";
import useSelectedAccount from "./useSelectedAccount";

type Callback = (
	collectionId: NFTCollectionId,
	metadataPath: string,
	quantity: number,
	royalty: number
) => Promise<string>;

export default function useNFTMint(): Callback {
	const api = useCENNZApi();
	const { extension } = useMetaMaskExtension();
	const { wallet } = useCENNZWallet();
	const { selectedAccount: metaMaskAccount } = useMetaMaskWallet();
	const { selectedWallet } = useWalletProvider();
	const selectedAccount = useSelectedAccount();
	const { showDialog } = useDialog();
	const { confirmSufficientFund } = useGasEstimate();

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

			const collectionExt = selectByRuntime(api, {
				current: () =>
					api.tx.nft.createCollection("Litho (default)", null, null),
				cerulean: () => api.tx.nft.createCollection("Litho (default)", null),
			});

			const mintExt = selectByRuntime(api, {
				current: () =>
					api.tx.nft.mintSeries(
						collectionId || nextCollectionId,
						quantity,
						selectedAccount.address,
						null,
						metadataPath,
						royalty
							? {
									entitlements: [[selectedAccount.address, royalty * 10000]],
							  }
							: null
					),
				cerulean: () =>
					api.tx.nft.mintSeries(
						collectionId || nextCollectionId,
						quantity,
						selectedAccount.address,
						{ IpfsShared: metadataPath },
						royalty
							? {
									entitlements: [[selectedAccount.address, royalty * 10000]],
							  }
							: null
					),
			});

			const extrinsics = [
				!isFinite(collectionId) ? collectionExt : null,
				mintExt,
			].filter(Boolean);

			const extrinsic =
				extrinsics.length === 1
					? extrinsics[0]
					: api.tx.utility.batchAll(extrinsics);

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
