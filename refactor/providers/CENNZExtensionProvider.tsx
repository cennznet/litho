import {
	InjectedExtension,
	InjectedAccountWithMeta,
} from "@polkadot/extension-inject/types";
import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
	useCallback,
	useMemo,
} from "react";
import type * as Extension from "@polkadot/extension-dapp";
import { useUserAgent } from "@refactor/providers/UserAgentProvider";
import { useDialog } from "@refactor/providers/DialogProvider";
import Link from "@refactor/components/Link";
import Button from "@refactor/components/Button";
import { useWalletProvider } from "@refactor/providers/WalletProvider";

type ExtensionContext = typeof Extension & {
	accounts: Array<InjectedAccountWithMeta>;
	promptInstallExtension: () => void;
	getInstalledExtension: () => Promise<InjectedExtension>;
};

const CENNZExtensionContext = createContext<ExtensionContext>(
	{} as ExtensionContext
);

type ProviderProps = {};

export default function CENNZExtensionProvider({
	children,
}: PropsWithChildren<ProviderProps>) {
	const { browser } = useUserAgent();
	const { selectedWallet } = useWalletProvider();
	const [module, setModule] = useState<typeof Extension>();
	const [accounts, setAccounts] = useState<Array<InjectedAccountWithMeta>>();
	const { showDialog, closeDialog } = useDialog();

	const promptInstallExtension = useCallback(async () => {
		const url =
			browser.name === "Firefox"
				? "https://addons.mozilla.org/en-US/firefox/addon/cennznet-browser-extension/"
				: "https://chrome.google.com/webstore/detail/cennznet-extension/feckpephlmdcjnpoclagmaogngeffafk";

		const action = (
			<>
				<Button variant="hollow" onClick={closeDialog}>
					Dismiss
				</Button>
				<Link href={url} onClick={closeDialog}>
					<Button>Install CENNZnet Extension</Button>
				</Link>
			</>
		);

		await showDialog({
			title: "Missing CENNZnet Extension",
			message:
				"To continue please install the CENNZnet Extension for your browser and create at least an account.",
			action,
		});
	}, [browser, showDialog, closeDialog]);

	useEffect(() => {
		import("@polkadot/extension-dapp").then(setModule);
	}, []);

	const getInstalledExtension = useMemo(() => {
		if (!module) return;

		return async () => {
			const { web3Enable, web3FromSource } = module;
			await web3Enable("Litho");
			return await web3FromSource("cennznet-extension").catch(() => null);
		};
	}, [module]);

	useEffect(() => {
		if (!module || !showDialog || selectedWallet !== "CENNZnet") return;
		let unsubscribe: () => void;

		const fetchAccounts = async () => {
			const { web3Enable, web3Accounts, web3AccountsSubscribe } = module;

			await web3Enable("Litho");
			const accounts = (await web3Accounts()) || [];
			if (!accounts.length)
				return showDialog({
					title: "Missing CENNZnet Account",
					message:
						"To continue please create at least one account using the CENNZnet Extension.",
				});

			setAccounts(accounts);

			unsubscribe = await web3AccountsSubscribe((accounts) => {
				setAccounts([...accounts]);
			});
		};

		fetchAccounts();

		return unsubscribe;
	}, [module, showDialog, selectedWallet]);

	return (
		<CENNZExtensionContext.Provider
			value={{
				...module,
				accounts,
				getInstalledExtension,
				promptInstallExtension,
			}}>
			{children}
		</CENNZExtensionContext.Provider>
	);
}

export function useCENNZExtension(): ExtensionContext {
	return useContext(CENNZExtensionContext);
}
