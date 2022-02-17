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
import { useAssets } from "@refactor/providers/SupportedAssetsProvider";
import extractExtensionMetadata from "@refactor/utils/extractExtensionMetadata";
import { AssetInfo } from "@refactor/types";

export type BalanceInfo = AssetInfo & {
	rawValue: any;
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
	checkSufficientFund: (
		requiredFund: number,
		paymentAssetId: number
	) => boolean;
};

const SupportedWalletContext = createContext<WalletContext>(
	{} as WalletContext
);

type ProviderProps = {};

export default function SupportedWalletProvider({
	children,
}: PropsWithChildren<ProviderProps>) {
	const api = useCENNZApi();
	const { promptInstallExtension, extension, accounts } = useCENNZExtension();
	const [wallet, setWallet] = useState<InjectedExtension>(null);
	const [account, setAccount] = useState<InjectedAccountWithMeta>(null);

	const connectWallet = useCallback(
		async (callback) => {
			if (!api) return;

			if (!extension) {
				callback?.();
				return promptInstallExtension();
			}

			callback?.();
			setWallet(extension);
			store.set("CENNZNET-EXTENSION", extension);
		},
		[promptInstallExtension, extension, api]
	);

	const disconnectWallet = useCallback(() => {
		store.remove("CENNZNET-EXTENSION");
		store.remove("CENNZNET-ACCOUNT");
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
		async function restoreWallet() {
			if (extension === null) return disconnectWallet();
			const storedWallet = store.get("CENNZNET-EXTENSION");
			if (!storedWallet) return;
			setWallet(extension);
		}

		restoreWallet();
	}, [extension, disconnectWallet]);

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

	// 3. Fetch `account` balance plus provide a function to re-fetch balances as needed
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
				rawValue: balance as any,
				value: (balance as any) / Math.pow(10, asset.decimals),
			};
		});

		setBalances(balances);
	}, [assets, account?.address, api]);

	useEffect(() => {
		fetchAssetBalances();
	}, [fetchAssetBalances]);

	const checkSufficientFund = useCallback(
		(requiredFund, paymentAssetId) => {
			if (!balances?.length) return;
			const balance = balances.find(
				(balance) => balance.assetId === paymentAssetId
			);
			if (!balance) throw new Error(`Asset "${paymentAssetId}" is not found`);

			return (balance.rawValue?.toJSON?.() as number) >= requiredFund;
		},
		[balances]
	);

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
				checkSufficientFund,
			}}>
			{children}
		</SupportedWalletContext.Provider>
	);
}

export function useWallet(): WalletContext {
	return useContext(SupportedWalletContext);
}
