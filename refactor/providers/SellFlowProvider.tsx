import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useState,
} from "react";
import { NFTId } from "@refactor/types";
import SellFlowModal from "@refactor/components/SellFlowModal";

type FlowContext = {
	startListing: (tokenId: NFTId) => Promise<void>;
};

const SellFlowContext = createContext<FlowContext>({} as FlowContext);

type ProviderProps = {};

export default function SellFlowProvider({
	children,
}: PropsWithChildren<ProviderProps>) {
	const [tokenId, setTokenId] = useState<NFTId>();
	const [modalOpened, setModalOpened] = useState<boolean>(false);
	const onModalRequestClose = useCallback(() => {
		setModalOpened(false);
	}, []);

	const startListing = useCallback(async (tokenId: NFTId) => {
		if (!tokenId) return;

		setTokenId(tokenId);
		setModalOpened(true);
	}, []);

	return (
		<>
			<SellFlowContext.Provider value={{ startListing }}>
				{children}
			</SellFlowContext.Provider>
			<SellFlowModal
				tokenId={tokenId}
				isOpen={modalOpened}
				onRequestClose={onModalRequestClose}
			/>
		</>
	);
}

export function useSellFlow(): FlowContext {
	return useContext(SellFlowContext);
}
