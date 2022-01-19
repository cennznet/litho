import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import type * as Extension from "@polkadot/extension-dapp";

type ModuleContext = typeof Extension;
const DAppModuleContext = createContext<ModuleContext>({} as ModuleContext);

type ProviderProps = {};

export default function DAppModuleProvider({
	children,
}: PropsWithChildren<ProviderProps>) {
	const [extension, setExtension] = useState<ModuleContext>(
		{} as ModuleContext
	);
	useEffect(() => {
		import("@polkadot/extension-dapp").then((module) => {
			setExtension(module);
		});
	}, []);

	return (
		<DAppModuleContext.Provider value={extension}>
			{children}
		</DAppModuleContext.Provider>
	);
}

export function useDAppModule(): ModuleContext {
	return useContext(DAppModuleContext);
}
