import { useCallback, useState } from "react";
import { DOMComponentProps, WalletOption } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { Hr } from "@refactor/components/Modal";
import { useCENNZWallet } from "@refactor/providers/CENNZWalletProvider";
import CENNZnetSVG from "@refactor/assets/vectors/cennznet-logo.svg";
import MetaMaskSVG from "@refactor/assets/vectors/metamask.svg";

import ThreeDots from "@refactor/components/ThreeDots";
import Text from "@refactor/components/Text";
import { useMetaMaskWallet } from "@refactor/providers/MetaMaskWalletProvider";

const bem = createBEMHelper(require("./WalletConnect.module.scss"));

type ComponentProps = {};

export default function WalletConnect({}: DOMComponentProps<
	ComponentProps,
	"div"
>) {
	const { connectWallet: connectCENNZWallet } = useCENNZWallet();
	const { connectWallet: connectMetaMask } = useMetaMaskWallet();
	const [busy, setBusy] = useState<boolean>(false);

	const onWalletClick = useCallback(
		(wallet: WalletOption) => {
			setBusy(true);

			const callback = () => setTimeout(() => setBusy(false), 1000);

			if (wallet === "CENNZnet") return connectCENNZWallet(callback);

			if (wallet === "MetaMask") return connectMetaMask(callback);
		},
		[connectCENNZWallet, connectMetaMask]
	);

	return (
		<div className={bem("root")}>
			<Text className={bem("title")} variant="headline4">
				Connect Wallet
			</Text>
			<p>
				Connect with one of our available wallet providers or create a new one.
			</p>

			<Hr />

			<div className={bem("list")}>
				<button
					className={bem("wallet")}
					onClick={() => onWalletClick("MetaMask")}
					disabled={busy}>
					<img
						src={MetaMaskSVG.src}
						alt="MetaMask logo"
						className={bem("metaMaskIcon")}
					/>
					<span className={bem("walletName")}>
						{!busy ? "MetaMask Wallet" : "Connecting"}
					</span>
					{busy && <ThreeDots />}
				</button>
				<br />
				<button
					className={bem("wallet")}
					onClick={() => onWalletClick("CENNZnet")}
					disabled={busy}>
					<CENNZnetSVG className={bem("walletIcon")} />
					<span className={bem("walletName")}>
						{!busy ? "CENNZnet Wallet" : "Connecting"}
					</span>
					{busy && <ThreeDots />}
				</button>
			</div>
		</div>
	);
}
