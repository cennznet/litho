import { useMemo } from "react";
import { cvmToAddress } from "@cennznet/types/utils";
import { useCENNZWallet } from "@refactor/providers/CENNZWalletProvider";
import { useMetaMaskWallet } from "@refactor/providers/MetaMaskWalletProvider";
import { useWalletProvider } from "@refactor/providers/WalletProvider";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

export default function useSelectedAccount(): Partial<InjectedAccountWithMeta> {
	const { account: cennzAccount } = useCENNZWallet();
	const { selectedAccount: metaMaskAccount } = useMetaMaskWallet();
	const { selectedWallet } = useWalletProvider();

	return useMemo(() => {
		if (selectedWallet === "CENNZnet") return cennzAccount;
		if (selectedWallet === "MetaMask" && !!metaMaskAccount?.address)
			return { address: cvmToAddress(metaMaskAccount.address) };
	}, [cennzAccount, metaMaskAccount, selectedWallet]);
}
