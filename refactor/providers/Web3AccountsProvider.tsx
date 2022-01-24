import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { useDAppModule } from "@refactor/providers/DAppModuleProvider";

const Web3AccountsContext = createContext<Array<InjectedAccountWithMeta>>(null);

type ProviderProps = {};

export default function Web3AccountsProvider({
	children,
}: PropsWithChildren<ProviderProps>) {
	const { web3Enable, web3Accounts, web3AccountsSubscribe } = useDAppModule();
	const [accounts, setAccounts] =
		useState<Array<InjectedAccountWithMeta>>(null);

	useEffect(() => {
		if (!web3Enable) return;

		let unsubscibre: () => void;

		async function fetchAndSubscribeAccounts() {
			await web3Enable("Litho");
			const accounts = await web3Accounts();
			setAccounts(accounts);

			unsubscibre = await web3AccountsSubscribe(setAccounts);
		}

		fetchAndSubscribeAccounts();

		return unsubscibre;
	}, [web3Enable, web3Accounts, web3AccountsSubscribe]);

	return (
		<Web3AccountsContext.Provider value={accounts}>
			{children}
		</Web3AccountsContext.Provider>
	);
}

export function useWeb3Accounts(): Array<InjectedAccountWithMeta> {
	return useContext(Web3AccountsContext);
}