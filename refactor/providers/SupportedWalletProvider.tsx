import { InjectedExtension } from "@polkadot/extension-inject/types";
import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useState,
} from "react";
import { SupportedWallet } from "@refactor/enums";

type WalletContext = {
	wallet: InjectedExtension;
	connectWallet: (
		name: SupportedWallet,
		callback?: () => void
	) => Promise<void>;
	disconnectWallet: (callback?: () => void) => Promise<void>;
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
	const [wallet, setWallet] = useState<InjectedExtension>(null);
	const connectWallet = useCallback(async (name, callback) => {}, []);
	const disconnectWallet = useCallback(async (callback) => {}, []);

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
