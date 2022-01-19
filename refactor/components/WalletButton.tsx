import { useCallback, useState } from "react";
import { DOMComponentProps } from "@refactor/types";
import { ReactComponent as WalletSVG } from "@refactor/assets/vectors/wallet.svg";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import Modal from "@refactor/components/Modal";
import WalletConnect from "@refactor/components/WalletConnect";

import styles from "./WalletButton.module.scss";

const bem = createBEMHelper(styles);

type ComponentProps = {
	connectLabel?: string;
	connectedLabel?: string;
};

export default function WalletButton({
	connectedLabel = "Wallet Connected",
	connectLabel = "Connect Wallet",
	className,
	...props
}: DOMComponentProps<ComponentProps, "button">) {
	const { wallet, connectWallet } = useWallet();
	const [modalOpened, setModalOpened] = useState<boolean>(false);
	const onModalRequestClose = useCallback(() => {
		setModalOpened(false);
	}, []);
	const onButtonClick = useCallback(() => {
		setModalOpened(!modalOpened);
	}, [modalOpened]);

	return (
		<>
			<button
				{...props}
				className={bem("root", className)}
				onClick={onButtonClick}>
				<WalletSVG className={bem("icon")} />
				<label className={bem("label")}>{connectLabel}</label>
			</button>

			<Modal
				isOpen={modalOpened}
				onRequestClose={onModalRequestClose}
				className={bem("modal")}>
				{!wallet && <WalletConnect />}
			</Modal>
		</>
	);
}
