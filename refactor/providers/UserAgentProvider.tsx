import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import type { IBrowser, IOS, IDevice } from "ua-parser-js";

type AgentContext = {
	browser: IBrowser;
	os: IOS;
	device: IDevice;
};
const UserAgentContext = createContext<AgentContext>({} as AgentContext);

type ProviderProps = {};

export default function UserAgentProvider({
	children,
}: PropsWithChildren<ProviderProps>) {
	const [userAgent, setUserAgent] = useState<AgentContext>({} as AgentContext);

	useEffect(() => {
		import("ua-parser-js").then(({ default: UAParser }) => {
			const instance = new UAParser();
			setUserAgent({
				browser: instance.getBrowser(),
				device: instance.getDevice(),
				os: instance.getOS(),
			});
		});
	}, []);

	return (
		<UserAgentContext.Provider value={userAgent}>
			{children}
		</UserAgentContext.Provider>
	);
}

export function useUserAgent(): AgentContext {
	return useContext(UserAgentContext);
}
