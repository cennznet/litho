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
import { useDAppModule } from "@refactor/providers/DAppModuleProvider";
import { useUserAgent } from "@refactor/providers/UserAgentProvider";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import {
	useAssets,
	AssetInfo,
} from "@refactor/providers/SupportedAssetsProvider";
import extractExtensionMetadata from "@refactor/utils/extractExtensionMetadata";
import { useWeb3Accounts } from "./Web3AccountsProvider";

export type BalanceInfo = AssetInfo & {
	value: number;
};

type WalletContext = {
	balances: Array<BalanceInfo>;
	account: InjectedAccountWithMeta;
	wallet: InjectedExtension;
	connectWallet: (callback?: () => void) => Promise<void>;
	disconnectWallet: () => void;
	selectAccount: (account: InjectedAccountWithMeta) => void;
};

const SupportedWalletContext = createContext<WalletContext>({
	balances: null,
	account: null,
	wallet: null,
	connectWallet: null,
	disconnectWallet: null,
	selectAccount: null,
});

type ProviderProps = {};

export default function SupportedWalletProvider({
	children,
}: PropsWithChildren<ProviderProps>) {
	const { browser } = useUserAgent();
	const api = useCENNZApi();
	const accounts = useWeb3Accounts();
	const { web3Enable } = useDAppModule();
	const [wallet, setWallet] = useState<InjectedExtension>(null);
	const [account, setAccount] = useState<InjectedAccountWithMeta>(null);

	const connectWallet = useCallback(
		async (callback) => {
			if (!web3Enable || !api) return;

			const extension = (await web3Enable("Litho")).find(
				(extension) => extension.name === "cennznet-extension"
			);

			if (!extension) {
				const confirmed = confirm(
					"Please install the CENNZnet extension then refresh the page."
				);

				if (!confirmed) return;

				window.open(
					browser.name === "Firefox"
						? "https://addons.mozilla.org/en-US/firefox/addon/cennznet-browser-extension/"
						: "https://chrome.google.com/webstore/detail/cennznet-extension/feckpephlmdcjnpoclagmaogngeffafk",
					"_blank"
				);

				return;
			}

			const metaUpdated = store.get("EXTENSION_META_UPDATED");

			if (!metaUpdated) {
				const metadataDef = await extractExtensionMetadata(api);
				if (!metadataDef) return;
				await extension.metadata.provide(metadataDef as any);
				store.set("EXTENSION_META_UPDATED", "true");
			}

			if (callback) callback();
			setWallet(extension);
			store.set("CENNZNET-EXTENSION", extension);
		},
		[web3Enable, browser, api]
	);

	const disconnectWallet = useCallback(() => {
		if (!confirm("Are you sure?")) return;
		store.remove("CENNZNET-EXTENSION");
		store.remove("CENNZNET-ACCOUNT");
		store.remove("EXTENSION_META_UPDATED");
		setWallet(null);
		setAccount(null);
		setBalances(null);
	}, []);

	const selectAccount = useCallback((account) => {
		setAccount(account);
		store.set("CENNZNET-ACCOUNT", account);
	}, []);

	// 1. Restore the wallet from the store if it exists
	useEffect(() => {
		const storedWallet = store.get("CENNZNET-EXTENSION");
		if (storedWallet) setWallet(storedWallet);
	}, []);

	// 2. pick the right account once a `wallet` as been set
	useEffect(() => {
		if (!wallet || !accounts) return;

		if (!accounts.length)
			return alert("Please create an account in the CENNZnet extension.");

		const storedAccount = store.get("CENNZNET-ACCOUNT");
		if (!storedAccount) return selectAccount(accounts[0]);

		const matchedAccount = accounts.find(
			(account) => account.address === storedAccount.address
		);
		if (!matchedAccount) return selectAccount(accounts[0]);

		selectAccount(matchedAccount);
	}, [wallet, web3Enable, accounts, selectAccount]);

	// 3. Fetch `account` balance
	const assets = useAssets();
	const [balances, setBalances] = useState<Array<BalanceInfo>>();
	useEffect(() => {
		if (!assets || !account || !api) return;

		async function fetchAssetBalances() {
			const balances = (
				await api.query.genericAsset.freeBalance.multi(
					assets.map(({ id }) => [id, account.address])
				)
			).map((balance, index) => {
				const asset = assets[index];
				return {
					...asset,
					value: (balance as any) / Math.pow(10, asset.decimals),
				};
			});

			setBalances(balances);
		}

		fetchAssetBalances();
	}, [assets, account, api]);

	return (
		<SupportedWalletContext.Provider
			value={{
				balances,
				account,
				wallet,
				connectWallet,
				disconnectWallet,
				selectAccount,
			}}>
			{children}
		</SupportedWalletContext.Provider>
	);
}

export function useWallet(): WalletContext {
	return useContext(SupportedWalletContext);
}
