import { InjectedExtension } from "@polkadot/extension-inject/types";
import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useState,
} from "react";
import { Wallet } from "@refactor/enums";

type WalletContext = {
	wallet: InjectedExtension;
	connectWallet: (name: Wallet, callback?: () => void) => Promise<void>;
	disconnectWallet: (callback?: () => void) => Promise<void>;
};

const WalletContext = createContext<WalletContext>({
	wallet: null,
	connectWallet: null,
	disconnectWallet: null,
});

type WalletProviderProps = {};

export default function WalletProvider({
	children,
}: PropsWithChildren<WalletProviderProps>) {
	const [wallet, setWallet] = useState<InjectedExtension>(null);
	const connectWallet = useCallback(async (name, callback) => {}, []);
	const disconnectWallet = useCallback(async (callback) => {}, []);

	return (
		<WalletContext.Provider value={{ wallet, connectWallet, disconnectWallet }}>
			{children}
		</WalletContext.Provider>
	);
}

export function useWallet(): WalletContext {
	return useContext(WalletContext);
}
