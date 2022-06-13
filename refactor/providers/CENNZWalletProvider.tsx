import {
	InjectedExtension,
	InjectedAccountWithMeta,
} from "@polkadot/extension-inject/types";
import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import store from "store";
import { useCENNZExtension } from "@refactor/providers/CENNZExtensionProvider";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { AssetInfo } from "@refactor/types";
import {
	useUnsupportDialog,
	useRuntimeMode,
} from "@refactor/providers/UserAgentProvider";
import extractExtensionMetadata from "@refactor/utils/extractExtensionMetadata";
import { useWalletProvider } from "@refactor/providers/WalletProvider";

export type BalanceInfo = AssetInfo & {
	rawValue: any;
	value: number;
};

type WalletContext = {
	account: InjectedAccountWithMeta;
	selectAccount: (account: InjectedAccountWithMeta) => void;

	wallet: InjectedExtension;
	connectWallet: (callback?: () => void) => Promise<void>;
	disconnectWallet: () => void;
};

const SupportedWalletContext = createContext<WalletContext>(
	{} as WalletContext
);

type ProviderProps = {};

export default function CENNZWalletProvider({
	children,
}: PropsWithChildren<ProviderProps>) {
	const api = useCENNZApi();
	const { setSelectedWallet, setCennzBalances } = useWalletProvider();
	const { promptInstallExtension, getInstalledExtension, accounts } =
		useCENNZExtension();
	const [wallet, setWallet] = useState<InjectedExtension>(null);
	const [account, setAccount] = useState<InjectedAccountWithMeta>(null);
	const showUnsupportedMessage = useUnsupportDialog();
	const runtimeMode = useRuntimeMode();

	const connectWallet = useCallback(
		async (callback) => {
			if (!api) return;

			if (runtimeMode === "ReadOnly") {
				callback?.();
				return showUnsupportedMessage(
					"Sorry, this browser is not supported by the CENNZnet Wallet. To successfully connect to the CENNZnet Wallet, please use either a Chrome or Firefox browsers on a Mac or PC."
				);
			}

			const extension = await getInstalledExtension?.();

			if (!extension) {
				callback?.();
				return promptInstallExtension();
			}

			setSelectedWallet("CENNZnet");
			setWallet(extension);
			store.set("CENNZNET-EXTENSION", extension);
		},
		[
			promptInstallExtension,
			getInstalledExtension,
			api,
			runtimeMode,
			showUnsupportedMessage,
			setSelectedWallet,
		]
	);

	const disconnectWallet = useCallback(() => {
		store.remove("CENNZNET-EXTENSION");
		store.remove("CENNZNET-ACCOUNT");
		setWallet(null);
		setAccount(null);
		setCennzBalances(null);
	}, []);

	const selectAccount = useCallback((account) => {
		setAccount(account);
		store.set("CENNZNET-ACCOUNT", account);
	}, []);

	// 1. Restore the wallet from the store if it exists
	useEffect(() => {
		async function restoreWallet() {
			const storedWallet = store.get("CENNZNET-EXTENSION");
			if (!storedWallet) return disconnectWallet();
			const extension = await getInstalledExtension?.();
			setWallet(extension);
		}

		restoreWallet();
	}, [disconnectWallet, getInstalledExtension]);

	// 2. Pick the right account once a `wallet` has been set
	useEffect(() => {
		if (!wallet || !accounts || !selectAccount) return;

		const storedAccount = store.get("CENNZNET-ACCOUNT");
		if (!storedAccount) return selectAccount(accounts[0]);

		const matchedAccount = accounts.find(
			(account) => account.address === storedAccount.address
		);
		if (!matchedAccount) return selectAccount(accounts[0]);

		selectAccount(matchedAccount);
	}, [wallet, accounts, selectAccount]);

	useEffect(() => {
		if (!api || !wallet) return;

		(window as any).extractExtensionMetadata = async () => {
			const metadata = await extractExtensionMetadata(api);
			wallet.metadata.provide(metadata as any);
			console.log("success");
		};
	}, [wallet, api]);

	return (
		<SupportedWalletContext.Provider
			value={{
				account,
				selectAccount,

				wallet,
				connectWallet,
				disconnectWallet,
			}}>
			{children}
		</SupportedWalletContext.Provider>
	);
}

export function useCENNZWallet(): WalletContext {
	return useContext(SupportedWalletContext);
}
