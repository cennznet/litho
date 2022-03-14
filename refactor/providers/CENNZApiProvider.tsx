import { Api } from "@cennznet/api";
import {
	createContext,
	useEffect,
	useState,
	PropsWithChildren,
	useContext,
} from "react";

const CENNZApiContext = createContext<Api>(null);

type ProviderProps = {
	endpoint: string;
};

export default function CENNZApiProvider({
	endpoint,
	children,
}: PropsWithChildren<ProviderProps>) {
	const [api, setApi] = useState<Api>(null);

	useEffect(() => {
		const instance = new Api({ provider: endpoint });
		instance.isReady.then(() => setApi(instance));
	}, [endpoint]);

	return (
		<CENNZApiContext.Provider value={api}>{children}</CENNZApiContext.Provider>
	);
}

export function useCENNZApi(): Api {
	return useContext(CENNZApiContext);
}
