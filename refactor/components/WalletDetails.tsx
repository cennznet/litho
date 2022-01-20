import { DOMComponentProps } from "@refactor/types";
import AccountAddress from "@refactor/providers/AccountAddress";
import Identicon from "@polkadot/react-identicon";
import { Hr } from "@refactor/components/Modal";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import Text from "@refactor/components/Text";
import { ReactComponent as CENNZnetSVG } from "@refactor/assets/vectors/cennznet-logo.svg";
import { ReactComponent as CPAYSVG } from "@refactor/assets/vectors/cpay-logo.svg";
import Link from "@refactor/components/Link";
import createBEMHelper from "@refactor/utils/createBEMHelper";

const bem = createBEMHelper(require("./WalletDetails.module.scss"));

type ComponentProps = {};

export default function WalletDetails({
	className,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const { account, balances, disconnectWallet } = useWallet();

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
					<Text className={bem("title")} variant="headline4">
						{account.meta.name}
					</Text>
					<AccountAddress
						className={bem("address")}
						address={account.address}
						length={8}
					/>
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
