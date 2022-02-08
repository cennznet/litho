import { InjectedExtension } from "@polkadot/extension-inject/types";
import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import type * as Extension from "@polkadot/extension-dapp";
import { useUserAgent } from "@refactor/providers/UserAgentProvider";

type ExtensionContext = typeof Extension & {
	getExtension?: () => Promise<InjectedExtension>;
};
const CENNZExtensionContext = createContext<ExtensionContext>(
	{} as ExtensionContext
);

type ProviderProps = {};

export default function CENNZExtensionProvider({
	children,
}: PropsWithChildren<ProviderProps>) {
	const [extension, setExtension] = useState<ExtensionContext>(
		{} as ExtensionContext
	);

	const { browser } = useUserAgent();

	useEffect(() => {
		import("@polkadot/extension-dapp").then((module) => {
			const { web3Enable, web3FromSource } = module;

			const getExtension = async function () {
				await web3Enable("Litho");
				const extension = await web3FromSource("cennznet-extension").catch(
					() => null
				);

				if (!extension) {
					const confirmed = confirm(
						"Please install the CENNZnet extension and create at least one account."
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

				return extension;
			};

			setExtension({ ...module, getExtension });
		});
	}, [browser]);

	return (
		<CENNZExtensionContext.Provider value={extension}>
			{children}
		</CENNZExtensionContext.Provider>
	);
}

export function useCENNZExtension(): ExtensionContext {
	return useContext(CENNZExtensionContext);
}
