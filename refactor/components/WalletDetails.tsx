import { DOMComponentProps } from "@refactor/types";
import AccountAddress from "@refactor/components/AccountAddress";
import Identicon from "@polkadot/react-identicon";
import { Hr } from "@refactor/components/Modal";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import Text from "@refactor/components/Text";
import { ReactComponent as CENNZnetSVG } from "@refactor/assets/vectors/cennznet-logo.svg";
import { ReactComponent as CPAYSVG } from "@refactor/assets/vectors/cpay-logo.svg";
import Link from "@refactor/components/Link";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { useWeb3Accounts } from "@refactor/providers/Web3AccountsProvider";
import { useCallback } from "react";
import Button from "@refactor/components/Button";

const bem = createBEMHelper(require("./WalletDetails.module.scss"));

type ComponentProps = {};

export default function WalletDetails({
	className,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const accounts = useWeb3Accounts();
	const { account, balances, disconnectWallet, selectAccount } = useWallet();

	const onAccountSelect = useCallback(
		(event) => {
			selectAccount(
				accounts.find(({ address }) => event.target.value === address)
			);
		},
		[accounts, selectAccount]
	);

	return (
		<div className={bem("root")} {...props}>
			<div className={bem("account")}>
				<Identicon
					value={account.address}
					theme="beachball"
					size={48}
					className={bem("accountIcon")}
				/>
				<div className={bem("accountDetails")}>
					<Text className={bem("accountTitle")} variant="headline4">
						{account.meta.name}
					</Text>
					<AccountAddress
						className={bem("accountAddress")}
						address={account.address}
						length={8}
					/>
					{accounts.length > 1 && (
						<div className={bem("accountSelect")}>
							<select onChange={onAccountSelect} value={account.address}>
								{accounts.map((acc, index) => (
									<option value={acc.address} key={index}>
										{acc.meta.name}
									</option>
								))}
							</select>
							<label>Switch account</label>
						</div>
					)}
				</div>
			</div>

			<Hr />

			<Text variant="subtitle1">Balances</Text>

			<ul className={bem("balanceList")}>
				{balances.map(({ id, value, symbol }, key) => (
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

			<nav className={bem("linkList")}>
				<Link href="/me">My Profile</Link>
			</nav>

			<div className={bem("disconnect")} onClick={disconnectWallet}>
				Disconnect
			</div>
		</div>
	);
}
