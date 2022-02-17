import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import MintFlowModal from "@refactor/components/MintFlowModal";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import findCollectionIdByAddress from "@refactor/utils/findCollectionIdByAddress";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { NFTCollectionId } from "@refactor/types";
import { useRouter } from "next/router";
import trackPageview from "@refactor/utils/trackPageview";

type FlowContext = {
	startMinting: () => Promise<void>;
};

const MintFlowContext = createContext<FlowContext>({} as FlowContext);

type ProviderProps = {};

export default function MintFlowProvider({
	children,
}: PropsWithChildren<ProviderProps>) {
	const api = useCENNZApi();
	const { account } = useWallet();
	const [ownedCollectionId, setOwnedCollectionId] = useState<NFTCollectionId>();
	const [modalOpened, setModalOpened] = useState<{ resolve: () => void }>();
	const { asPath } = useRouter();
	const onModalRequestClose = useCallback(() => {
		setModalOpened((previous) => {
			previous?.resolve?.();
			trackPageview(asPath);
			return null;
		});
	}, [asPath]);

	const startMinting = useCallback(async () => {
		return new Promise<void>((resolve) => {
			setModalOpened({ resolve });
			trackPageview("/create");
		});
	}, []);

	useEffect(() => {
		if (!account?.address || !api) return;

		const address = account?.address;
		findCollectionIdByAddress(api, address).then(setOwnedCollectionId);
	}, [account?.address, api]);

	return (
		<>
			<MintFlowContext.Provider value={{ startMinting }}>
				{children}
			</MintFlowContext.Provider>
			<MintFlowModal
				collectionId={ownedCollectionId}
				isOpen={!!modalOpened}
				onRequestClose={onModalRequestClose}
			/>
		</>
	);
}

export function useMintFlow(): FlowContext {
	return useContext(MintFlowContext);
}
