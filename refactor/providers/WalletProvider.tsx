import { CennzBalances, WalletOption } from "@refactor/types";
import {
	createContext,
	Dispatch,
	FC,
	SetStateAction,
	useContext,
	useState,
	useEffect,
} from "react";
import store from "store";

interface WalletContextType {
	walletOpen: boolean;
	setWalletOpen: Dispatch<SetStateAction<boolean>>;

	selectedWallet: WalletOption;
	setSelectedWallet: Dispatch<SetStateAction<WalletOption>>;

	cennzBalances: CennzBalances;
	setCennzBalances: Dispatch<SetStateAction<CennzBalances>>;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

interface WalletProviderProps {}

const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
	const [walletOpen, setWalletOpen] = useState<boolean>(false);
	const [selectedWallet, setSelectedWallet] = useState<WalletOption>();
	const [cennzBalances, setCennzBalances] = useState<CennzBalances>();

	useEffect(() => {
		if (!selectedWallet) return setSelectedWallet(store.get("SELECTED-WALLET"));

		store.set("SELECTED-WALLET", selectedWallet);
	}, [selectedWallet]);

	return (
		<WalletContext.Provider
			value={{
				walletOpen,
				setWalletOpen,

				selectedWallet,
				setSelectedWallet,

				cennzBalances,
				setCennzBalances,
			}}>
			{children}
		</WalletContext.Provider>
	);
};

export default WalletProvider;

export function useWalletProvider(): WalletContextType {
	return useContext(WalletContext);
}
