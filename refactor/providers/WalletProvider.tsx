import { WalletOption } from "@refactor/types";
import {
	createContext,
	Dispatch,
	FC,
	SetStateAction,
	useContext,
	useState,
} from "react";

interface WalletContextType {
	walletOpen: boolean;
	setWalletOpen: Dispatch<SetStateAction<boolean>>;

	selectedWallet: WalletOption;
	setSelectedWallet: Dispatch<SetStateAction<WalletOption>>;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

interface WalletProviderProps {}

const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
	const [walletOpen, setWalletOpen] = useState<boolean>(false);
	const [selectedWallet, setSelectedWallet] = useState<WalletOption>();

	return (
		<WalletContext.Provider
			value={{
				walletOpen,
				setWalletOpen,

				selectedWallet,
				setSelectedWallet,
			}}>
			{children}
		</WalletContext.Provider>
	);
};

export default WalletProvider;

export function useWalletProvider(): WalletContextType {
	return useContext(WalletContext);
}
