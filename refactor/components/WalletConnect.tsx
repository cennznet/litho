import { useCallback, useState } from "react";
import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { Hr } from "@refactor/components/Modal";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import CENNZnetSVG from "@refactor/assets/vectors/cennznet-logo.svg";
import Spinner from "@refactor/components/Spinner";
import Text from "@refactor/components/Text";

const bem = createBEMHelper(require("./WalletConnect.module.scss"));

type ComponentProps = {};

export default function WalletConnect({}: DOMComponentProps<
	ComponentProps,
	"div"
>) {
	const { connectWallet } = useWallet();
	const [busy, setBusy] = useState<boolean>(false);

	const onWalletClick = useCallback(() => {
		setBusy(true);
		connectWallet(() => setBusy(false));
	}, [connectWallet]);

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
					onClick={onWalletClick}
					disabled={busy}>
					<CENNZnetSVG className={bem("walletIcon")} />
					<span className={bem("walletName")}>CENNZnet Wallet</span>
					{busy && <Spinner className={bem("walletSpinner")} />}
				</button>
			</div>
		</div>
	);
}
