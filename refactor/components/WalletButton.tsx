import { useCallback, useEffect } from "react";
import { DOMComponentProps } from "@refactor/types";
import WalletSVG from "@refactor/assets/vectors/wallet.svg";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import Modal from "@refactor/components/Modal";
import WalletConnect from "@refactor/components/WalletConnect";
import WalletDetails from "@refactor/components/WalletDetails";
import Identicon from "@polkadot/react-identicon";
import ThreeDots from "@refactor/components/ThreeDots";
import ChevronDownSVG from "@refactor/assets/vectors/chevron-down.svg";
import useSelectedAccount from "@refactor/hooks/useSelectedAccount";
import { useWalletProvider } from "@refactor/providers/WalletProvider";
import useCENNZBalances from "@refactor/hooks/useCENNZBalances";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";

const bem = createBEMHelper(require("./WalletButton.module.scss"));

type ComponentProps = {};

export default function WalletButton({
	className,
	...props
}: DOMComponentProps<ComponentProps, "button">) {
	const { walletOpen, setWalletOpen, cennzBalances } = useWalletProvider();
	const api = useCENNZApi();

	const selectedAccount = useSelectedAccount();
	const { updateCENNZBalances } = useCENNZBalances();

	const onModalRequestClose = useCallback(() => {
		setWalletOpen(false);
	}, []);

	const onButtonClick = useCallback(() => {
		setWalletOpen(!walletOpen);
	}, [walletOpen]);

	useEffect(() => {
		if ((!selectedAccount && cennzBalances?.length) || !api) return;

		setWalletOpen(false);
		updateCENNZBalances();
	}, [selectedAccount, cennzBalances?.length, api]);

	return (
		<>
			<button
				{...props}
				className={bem("root", className)}
				onClick={onButtonClick}>
				{!selectedAccount && !cennzBalances && (
					<>
						<WalletSVG className={bem("icon")} />
						<label className={bem("label")}>Connect Wallet</label>
					</>
				)}

				{!!selectedAccount && !cennzBalances && (
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

				{!!selectedAccount && !!cennzBalances && (
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
							)}>{`${cennzBalances[0].value} ${cennzBalances[0].symbol}`}</label>

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
				{!cennzBalances && <WalletConnect />}
				{!!cennzBalances && <WalletDetails />}
			</Modal>
		</>
	);
}
