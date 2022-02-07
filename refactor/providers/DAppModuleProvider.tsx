import { InjectedExtension } from "@polkadot/extension-inject/types";
import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type * as Extension from "@polkadot/extension-dapp";
import { useUserAgent } from "@refactor/providers/UserAgentProvider";

type ModuleContext = typeof Extension & {
	ensureCENNZExtension?: () => Promise<InjectedExtension>;
};
const DAppModuleContext = createContext<ModuleContext>({} as ModuleContext);

type ProviderProps = {};

export default function DAppModuleProvider({
	children,
}: PropsWithChildren<ProviderProps>) {
	const [extension, setExtension] = useState<ModuleContext>(
		{} as ModuleContext
	);

	const { browser } = useUserAgent();

	useEffect(() => {
		import("@polkadot/extension-dapp").then((module) => {
			const { web3Enable, web3FromSource } = module;

			const ensureCENNZExtension = async function () {
				await web3Enable("Litho");
				const extension = await web3FromSource("cennznet-extension").catch(
					(error) => null
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

				return extension;
			};

			setExtension({ ...module, ensureCENNZExtension });
		});
	}, [browser]);

	return (
		<DAppModuleContext.Provider value={extension}>
			{children}
		</DAppModuleContext.Provider>
	);
}

export function useDAppModule(): ModuleContext {
	return useContext(DAppModuleContext);
}
