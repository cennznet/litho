import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { IBrowser, IOS, IDevice } from "ua-parser-js";
import { useDialog } from "@refactor/providers/DialogProvider";

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

type RuntimeMode = "ReadOnly" | "ReadWrite";
export function useRuntimeMode(): RuntimeMode {
	const { browser, os } = useUserAgent();
	const [runtimeMode, setRuntimeMode] = useState<RuntimeMode>("ReadWrite");

	useEffect(() => {
		if (!browser?.name || !os?.name) return;
		if (browser.name === "Safari" || os.name === "iOS" || os.name === "Android")
			setRuntimeMode("ReadOnly");
	}, [browser?.name, os?.name]);

	return runtimeMode;
}

export function useUnsupportDialog(): (message: string) => Promise<void> {
	const { showDialog } = useDialog();
	const { browser, os } = useUserAgent();

	return useCallback(
		async (message: string) => {
			return showDialog({
				title: `${browser.name} (${os.name})`,
				message,
			});
		},
		[browser?.name, os?.name, showDialog]
	);
}
