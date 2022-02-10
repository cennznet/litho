import {
	InjectedExtension,
	InjectedAccountWithMeta,
} from "@polkadot/extension-inject/types";
import {
	createContext,
	PropsWithChildren,
	useMemo,
	useContext,
	useEffect,
	useState,
} from "react";
import type * as Extension from "@polkadot/extension-dapp";
import { useUserAgent } from "@refactor/providers/UserAgentProvider";

type ExtensionContext = typeof Extension & {
	accounts: Array<InjectedAccountWithMeta>;
	extension: InjectedExtension;
	promptInstallExtension: () => void;
};

const CENNZExtensionContext = createContext<ExtensionContext>(
	{} as ExtensionContext
);

type ProviderProps = {};

export default function CENNZExtensionProvider({
	children,
}: PropsWithChildren<ProviderProps>) {
	const { browser } = useUserAgent();
	const [module, setModule] = useState<typeof Extension>();
	const [extension, setExtension] = useState<InjectedExtension>();
	const [accounts, setAccounts] = useState<Array<InjectedAccountWithMeta>>();

	const promptInstallExtension = useMemo(() => {
		return async () => {
			if (
				!confirm(
					"Please install the CENNZnet extension and create at least one account."
				)
			)
				return;

			window.open(
				browser.name === "Firefox"
					? "https://addons.mozilla.org/en-US/firefox/addon/cennznet-browser-extension/"
					: "https://chrome.google.com/webstore/detail/cennznet-extension/feckpephlmdcjnpoclagmaogngeffafk",
				"_blank"
			);
		};
	}, [browser]);

	useEffect(() => {
		import("@polkadot/extension-dapp").then(setModule);
	}, []);

	useEffect(() => {
		if (!module) return;

		const getExtension = async () => {
			const { web3Enable, web3FromSource } = module;
			await web3Enable("Litho");
			const extension = await web3FromSource("cennznet-extension").catch(
				() => null
			);

			setExtension(extension);
		};

		getExtension();
	}, [module]);

	useEffect(() => {
		if (!module || !extension) return;
		let unsubscibre: () => void;

		const fetchAccounts = async () => {
			const { web3Enable, web3Accounts, web3AccountsSubscribe } = module;

			await web3Enable("Litho");
			const accounts = (await web3Accounts()) || [];
			if (!accounts.length)
				return alert(
					"Please create at least one account in the CENNZnet extension."
				);

			setAccounts(accounts);

			unsubscibre = await web3AccountsSubscribe((accounts) => {
				setAccounts([...accounts]);
			});
		};

		fetchAccounts();

		return unsubscibre;
	}, [module, extension]);

	return (
		<CENNZExtensionContext.Provider
			value={{ ...module, accounts, extension, promptInstallExtension }}>
			{children}
		</CENNZExtensionContext.Provider>
	);
}

export function useCENNZExtension(): ExtensionContext {
	return useContext(CENNZExtensionContext);
}
