import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import type * as Extension from "@polkadot/extension-dapp";

type ExtensionContext = typeof Extension;
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
	useEffect(() => {
		import("@polkadot/extension-dapp").then((response) => {
			console.log(response);
			setExtension(response);
		});
	}, []);

	return (
		<CENNZExtensionContext.Provider value={extension}>
			{children}
		</CENNZExtensionContext.Provider>
	);
}

export function useCENNZExtension(): ExtensionContext {
	return useContext(CENNZExtensionContext);
}
