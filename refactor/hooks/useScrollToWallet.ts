import { useCallback } from "react";
import { useWalletProvider } from "@refactor/providers/WalletProvider";

export default function useScrollToWallet(): Function {
	const { setWalletOpen } = useWalletProvider();

	return useCallback(() => {
		const innerHeight = window.innerHeight;
		const scrollHeight = document.body.scrollHeight;

		if (scrollHeight < innerHeight) return setWalletOpen(true);

		window.scrollTo({ top: 0, behavior: "smooth" });

		setTimeout(() => {
			setWalletOpen(true);
		}, 500);
	}, [setWalletOpen]);
}
