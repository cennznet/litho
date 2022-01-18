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
		try {
			const instance = new Api({ provider: endpoint });
			if (!instance)
				throw new Error(
					`API with endpoint \`${endpoint}\` failed to instantiate.`
				);

			instance.isReady.then(() => setApi(instance));
		} catch (err) {
			console.error(`[CENNZnet] ${err}`);
		}
	}, [endpoint]);

	return (
		<CENNZApiContext.Provider value={api}>{children}</CENNZApiContext.Provider>
	);
}

export function useCENNZApi(): Api {
	return useContext(CENNZApiContext);
}
