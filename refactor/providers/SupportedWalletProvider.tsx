import { InjectedExtension } from "@polkadot/extension-inject/types";
import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useState,
} from "react";
import { Wallet } from "@refactor/enums";

type SupportedWalletContext = {
	wallet: InjectedExtension;
	connectWallet: (name: Wallet, callback?: () => void) => Promise<void>;
	disconnectWallet: (callback?: () => void) => Promise<void>;
};

const SupportedWalletContext = createContext<SupportedWalletContext>({
	wallet: null,
	connectWallet: null,
	disconnectWallet: null,
});

type SupportedWalletProviderProps = {};

export default function SupportedWalletProvider({
	children,
}: PropsWithChildren<SupportedWalletProviderProps>) {
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

export function useWallet(): SupportedWalletContext {
	return useContext(SupportedWalletContext);
}
