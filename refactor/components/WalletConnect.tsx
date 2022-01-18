import { DOMComponentProps } from "@refactor/types";
import { ReactComponent as WalletSVG } from "@refactor/assets/vectors/wallet.svg";
import styles from "./WalletConnect.module.scss";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
const bem = createBEMHelper(styles);

type ComponentProps = {
	connectLabel?: string;
	connectedLabel?: string;
};

export default function WalletConnect({
	connectedLabel = "Wallet Connected",
	connectLabel = "Connect Wallet",
	className,
	...props
}: DOMComponentProps<ComponentProps, "button">) {
	const { wallet, connectWallet } = useWallet();

	return (
		<button {...props} className={bem("root", className)}>
			<WalletSVG className={bem("icon")} />
			<label className={bem("label")}>{connectLabel}</label>
		</button>
	);
}
