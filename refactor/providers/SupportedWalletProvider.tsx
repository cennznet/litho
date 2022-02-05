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
import { useAssets } from "@refactor/providers/SupportedAssetsProvider";
import extractExtensionMetadata from "@refactor/utils/extractExtensionMetadata";
import { useWeb3Accounts } from "@refactor/providers/Web3AccountsProvider";
import { AssetInfo } from "@refactor/types";

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
	fetchAssetBalances: () => Promise<void>;
};

const SupportedWalletContext = createContext<WalletContext>({
	balances: null,
	account: null,
	wallet: null,
	connectWallet: null,
	disconnectWallet: null,
	selectAccount: null,
	fetchAssetBalances: null,
});

type ProviderProps = {};

export default function SupportedWalletProvider({
	children,
}: PropsWithChildren<ProviderProps>) {
	const { browser } = useUserAgent();
	const api = useCENNZApi();
	const accounts = useWeb3Accounts();
	const { web3Enable, web3FromSource } = useDAppModule();
	const [wallet, setWallet] = useState<InjectedExtension>(null);
	const [account, setAccount] = useState<InjectedAccountWithMeta>(null);

	const connectWallet = useCallback(
		async (callback) => {
			if (!web3Enable || !api) return;

			await web3Enable("Litho");
			const extension = await web3FromSource("cennznet-extension");

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

			callback?.();
			setWallet(extension);
			store.set("CENNZNET-EXTENSION", extension);
		},
		[web3Enable, web3FromSource, browser, api]
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
		if (!web3Enable && !web3FromSource) return;

		async function restoreWallet() {
			const storedWallet = store.get("CENNZNET-EXTENSION");
			if (!storedWallet) return;
			await web3Enable("Litho");
			const extension = await web3FromSource(storedWallet.name);
			setWallet(extension);
		}

		restoreWallet();
	}, [web3Enable, web3FromSource]);

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
	const { assets } = useAssets();
	const [balances, setBalances] = useState<Array<BalanceInfo>>();
	const fetchAssetBalances = useCallback(async () => {
		if (!assets || !account?.address || !api) return;
		const balances = (
			await api.query.genericAsset.freeBalance.multi(
				assets.map(({ assetId }) => [assetId, account.address])
			)
		).map((balance, index) => {
			const asset = assets[index];
			return {
				...asset,
				value: (balance as any) / Math.pow(10, asset.decimals),
			};
		});

		setBalances(balances);
	}, [assets, account?.address, api]);

	useEffect(() => {
		fetchAssetBalances();
	}, [fetchAssetBalances]);

	return (
		<SupportedWalletContext.Provider
			value={{
				balances,
				account,
				wallet,
				connectWallet,
				disconnectWallet,
				selectAccount,
				fetchAssetBalances,
			}}>
			{children}
		</SupportedWalletContext.Provider>
	);
}

export function useWallet(): WalletContext {
	return useContext(SupportedWalletContext);
}
