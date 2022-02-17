import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useState,
} from "react";
import { NFTId } from "@refactor/types";
import SellFlowModal from "@refactor/components/SellFlowModal";
import { useRouter } from "next/router";
import trackPageview from "@refactor/utils/trackPageview";

type FlowContext = {
	startListing: (tokenId: NFTId) => Promise<void>;
};

const SellFlowContext = createContext<FlowContext>({} as FlowContext);

type ProviderProps = {};

export default function SellFlowProvider({
	children,
}: PropsWithChildren<ProviderProps>) {
	const [tokenId, setTokenId] = useState<NFTId>();
	const [modalOpened, setModalOpened] = useState<{ resolve: () => void }>();
	const { asPath } = useRouter();
	const onModalRequestClose = useCallback(() => {
		setModalOpened((previous) => {
			previous?.resolve?.();
			trackPageview(asPath);
			return null;
		});
	}, [asPath]);

	const startListing = useCallback(async (tokenId: NFTId) => {
		if (!tokenId) return;

		setTokenId(tokenId);
		return new Promise<void>((resolve) => {
			setModalOpened({ resolve });
			trackPageview(
				`/sell?collectionId=${tokenId[0]}&seriesId=${tokenId[1]}&serialNumber=${tokenId[2]}`
			);
		});
	}, []);

	return (
		<>
			<SellFlowContext.Provider value={{ startListing }}>
				{children}
			</SellFlowContext.Provider>
			<SellFlowModal
				tokenId={tokenId}
				isOpen={!!modalOpened}
				onRequestClose={onModalRequestClose}
			/>
		</>
	);
}

export function useSellFlow(): FlowContext {
	return useContext(SellFlowContext);
}
