import { useCallback, useEffect } from "react";
import { DOMComponentProps } from "@refactor/types";
import WalletSVG from "@refactor/assets/vectors/wallet.svg";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { useCENNZWallet } from "@refactor/providers/CENNZWalletProvider";
import Modal from "@refactor/components/Modal";
import WalletConnect from "@refactor/components/WalletConnect";
import WalletDetails from "@refactor/components/WalletDetails";
import Identicon from "@polkadot/react-identicon";
import ThreeDots from "@refactor/components/ThreeDots";
import ChevronDownSVG from "@refactor/assets/vectors/chevron-down.svg";
import useSelectedAccount from "@refactor/hooks/useSelectedAccount";
import { useWalletProvider } from "@refactor/providers/WalletProvider";

const bem = createBEMHelper(require("./WalletButton.module.scss"));

type ComponentProps = {};

export default function WalletButton({
	className,
	...props
}: DOMComponentProps<ComponentProps, "button">) {
	const { balances } = useCENNZWallet();
	const { walletOpen, setWalletOpen } = useWalletProvider();

	const selectedAccount = useSelectedAccount();

	const onModalRequestClose = useCallback(() => {
		setWalletOpen(false);
	}, []);
	const onButtonClick = useCallback(() => {
		setWalletOpen(!walletOpen);
	}, [walletOpen]);

	useEffect(() => {
		setWalletOpen(false);
	}, [balances?.length]);

	return (
		<>
			<button
				{...props}
				className={bem("root", className)}
				onClick={onButtonClick}>
				{!selectedAccount && !balances && (
					<>
						<WalletSVG className={bem("icon")} />
						<label className={bem("label")}>Connect Wallet</label>
					</>
				)}

				{!!selectedAccount && !balances && (
					<>
						<span title={selectedAccount.address}>
							<Identicon
								value={selectedAccount.address}
								theme="beachball"
								size={24}
								className={bem("icon")}
							/>
						</span>

						<label className={bem("label")}>
							Re-connecting
							<ThreeDots />
						</label>
					</>
				)}

				{!!selectedAccount && !!balances && (
					<>
						<div title={selectedAccount.address} className={bem("icon")}>
							<Identicon
								value={selectedAccount.address}
								theme="beachball"
								size={24}
							/>
						</div>

						<label
							className={bem(
								"label"
							)}>{`${balances[0].value} ${balances[0].symbol}`}</label>

						<span className={bem("chevron", { walletOpen })}>
							<ChevronDownSVG />
						</span>
					</>
				)}
			</button>

			<Modal
				isOpen={walletOpen}
				onRequestClose={onModalRequestClose}
				className={bem("modal")}
				overlayClassName={bem("modalOverlay")}
				innerClassName={bem("modalInner")}>
				{!balances && <WalletConnect />}
				{!!balances && <WalletDetails />}
			</Modal>
		</>
	);
}
