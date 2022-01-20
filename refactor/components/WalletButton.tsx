import { useCallback, useEffect, useState } from "react";
import { DOMComponentProps } from "@refactor/types";
import { ReactComponent as WalletSVG } from "@refactor/assets/vectors/wallet.svg";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import Modal from "@refactor/components/Modal";
import WalletConnect from "@refactor/components/WalletConnect";
import AccountAddress from "@refactor/providers/AccountAddress";
import Identicon from "@polkadot/react-identicon";

import styles from "./WalletButton.module.scss";

const bem = createBEMHelper(styles);

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
	}, [balances]);

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

						<AccountAddress
							className={bem("label")}
							address={account.address}
						/>
					</>
				)}

				{!!account && !!balances && (
					<>
						<span title={account.address}>
							<Identicon
								value={account.address}
								theme="beachball"
								size={24}
								className={bem("icon")}
							/>
						</span>

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
			</Modal>
		</>
	);
}
