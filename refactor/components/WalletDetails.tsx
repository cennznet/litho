import { DOMComponentProps } from "@refactor/types";
import AccountAddress from "@refactor/components/AccountAddress";
import Identicon from "@polkadot/react-identicon";
import { Hr } from "@refactor/components/Modal";
import { useCENNZWallet } from "@refactor/providers/CENNZWalletProvider";
import Text from "@refactor/components/Text";
import CENNZnetSVG from "@refactor/assets/vectors/cennznet-logo.svg";
import CPAYSVG from "@refactor/assets/vectors/cpay-logo.svg";
import Link from "@refactor/components/Link";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { useCENNZExtension } from "@refactor/providers/CENNZExtensionProvider";
import { useCallback } from "react";
import Button from "@refactor/components/Button";
import ChevronDownSVG from "@refactor/assets/vectors/chevron-down.svg";
import useSelectedAccount from "@refactor/hooks/useSelectedAccount";
import { useMetaMaskWallet } from "@refactor/providers/MetaMaskWalletProvider";
import { useWalletProvider } from "@refactor/providers/WalletProvider";
import store from "store";

const bem = createBEMHelper(require("./WalletDetails.module.scss"));

type ComponentProps = {};

export default function WalletDetails({
	className,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const { accounts } = useCENNZExtension();
	const { disconnectWallet, selectAccount } = useCENNZWallet();
	const { selectedAccount: metaMaskAccount } = useMetaMaskWallet();
	const { selectedWallet, setSelectedWallet, cennzBalances, setCennzBalances } =
		useWalletProvider();

	const selectedAccount = useSelectedAccount();

	const onAccountSelect = useCallback(
		(event) => {
			selectAccount(
				accounts.find(({ address }) => event.target.value === address)
			);
		},
		[accounts, selectAccount]
	);

	const onDisconnectClick = useCallback(() => {
		if (selectedWallet === "CENNZnet") {
			disconnectWallet();
		}
		if (selectedWallet === "MetaMask") {
			setCennzBalances(null);
		}
		store.remove("SELECTED-WALLET");
		setSelectedWallet(null);
		setCennzBalances(null);
	}, [selectedWallet, setSelectedWallet, setCennzBalances]);

	return (
		<div className={bem("root")} {...props}>
			<div className={bem("account")}>
				<Identicon
					value={selectedAccount.address}
					theme="beachball"
					size={48}
					className={bem("accountIcon")}
				/>
				<div className={bem("accountDetails")}>
					<Text className={bem("accountTitle")} variant="headline4">
						{selectedAccount?.meta?.name ?? "METAMASK"}
					</Text>
					<AccountAddress
						className={bem("accountAddress")}
						address={
							selectedWallet === "CENNZnet"
								? selectedAccount.address
								: metaMaskAccount.address
						}
						length={selectedWallet === "CENNZnet" ? 8 : 6}
					/>
					{selectedWallet === "CENNZnet" && accounts.length > 1 && (
						<div className={bem("accountSwitch")}>
							<select
								onChange={onAccountSelect}
								value={selectedAccount.address}
								className={bem("accountSelect")}>
								{accounts.map((acc, index) => (
									<option value={acc.address} key={index}>
										{acc.meta.name}
									</option>
								))}
							</select>
							<label className={bem("accountSwitchLabel")}>
								Switch account{" "}
								<span className={bem("chevron")}>
									<ChevronDownSVG />
								</span>
							</label>
						</div>
					)}
				</div>
			</div>

			<Hr />

			<Text variant="subtitle1">Balances</Text>

			<ul className={bem("balanceList")}>
				{cennzBalances.map(({ value, symbol }, key) => (
					<li key={key} className={bem("balanceItem")}>
						<div className={bem("balanceIcon")}>
							{symbol === "CENNZ" && (
								<span>
									<CENNZnetSVG />
								</span>
							)}
							{symbol === "CPAY" && (
								<span>
									<CPAYSVG />
								</span>
							)}
						</div>
						<span className={bem("balanceValue")}>{value}</span>&nbsp;
						<span className={bem("balanceSymbol")}>{symbol}</span>
					</li>
				))}
			</ul>

			<Link href="https://www.mexc.com">
				<Button className={bem("topUp")}>Top up</Button>
			</Link>

			<Hr />

			<div className={bem("disconnect")} onClick={onDisconnectClick}>
				Disconnect
			</div>
		</div>
	);
}
