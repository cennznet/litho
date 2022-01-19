import { InjectedExtension } from "@polkadot/extension-inject/types";
import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useState,
} from "react";
import store from "store";
import { useDAppModule } from "@refactor/providers/DAppModuleProvider";
import { useUserAgent } from "@refactor/providers/UserAgentProvider";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import extractExtensionMetadata from "@refactor/utils/extractExtensionMetadata";

type WalletContext = {
	wallet: InjectedExtension;
	connectWallet: (callback?: () => void) => Promise<void>;
	disconnectWallet: () => Promise<void>;
};

const SupportedWalletContext = createContext<WalletContext>({
	wallet: null,
	connectWallet: null,
	disconnectWallet: null,
});

type ProviderProps = {};

export default function SupportedWalletProvider({
	children,
}: PropsWithChildren<ProviderProps>) {
	const { browser } = useUserAgent();
	const { web3Enable } = useDAppModule();
	const api = useCENNZApi();
	const [wallet, setWallet] = useState<InjectedExtension>(null);
	const connectWallet = useCallback(
		async (callback) => {
			if (!web3Enable || !api) return;

			const extension = (await web3Enable("Litho")).find(
				(extension) => extension.name === "cennznet-extension"
			);

			if (!extension) {
				const confirmed = confirm(
					"Please install the CENNZnet extension then refresh page."
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
				console.log(metadataDef);
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

	const disconnectWallet = useCallback(async () => {}, []);

	return (
		<SupportedWalletContext.Provider
			value={{ wallet, connectWallet, disconnectWallet }}>
			{children}
		</SupportedWalletContext.Provider>
	);
}

export function useWallet(): WalletContext {
	return useContext(SupportedWalletContext);
}
