import { useCallback, useEffect, useState } from "react";
import { DOMComponentProps } from "@refactor/types";
import { ReactComponent as WalletSVG } from "@refactor/assets/vectors/wallet.svg";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import Modal from "@refactor/components/Modal";
import WalletConnect from "@refactor/components/WalletConnect";
import WalletDetails from "@refactor/components/WalletDetails";
import Identicon from "@polkadot/react-identicon";

const bem = createBEMHelper(require("./WalletButton.module.scss"));

type ComponentProps = {};

export default function WalletButton({
	className,
	...props
}: DOMComponentProps<ComponentProps, "button">) {
	const { account, balances } = useWallet();
	const [modalOpened, setModalOpened] = useState<boolean>(false);
	const onModalRequestClose = useCallback(() => {
		setModalOpened(false);
	}, []);
	const onButtonClick = useCallback(() => {
		setModalOpened(!modalOpened);
	}, [modalOpened]);

	useEffect(() => {
		setModalOpened(false);
	}, [balances?.length]);

	return (
		<>
			<button
				{...props}
				className={bem("root", className)}
				onClick={onButtonClick}>
				{!account && !balances && (
					<>
						<WalletSVG className={bem("icon")} />
						<label className={bem("label")}>Connect Wallet</label>
					</>
				)}

				{!!account && !balances && (
					<>
						<span title={account.address}>
							<Identicon
								value={account.address}
								theme="beachball"
								size={24}
								className={bem("icon")}
							/>
						</span>

						<label className={bem("label")}>Connecting...</label>
					</>
				)}

				{!!account && !!balances && (
					<>
						<div title={account.address} className={bem("icon")}>
							<Identicon value={account.address} theme="beachball" size={24} />
						</div>

						<label
							className={bem(
								"label"
							)}>{`${balances[0].value} ${balances[0].symbol}`}</label>
					</>
				)}
			</button>

			<Modal
				isOpen={modalOpened}
				onRequestClose={onModalRequestClose}
				className={bem("modal")}>
				{!balances && <WalletConnect />}
				{!!balances && <WalletDetails />}
			</Modal>
		</>
	);
}
