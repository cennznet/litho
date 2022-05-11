import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import Identicon from "@polkadot/react-identicon";
import { useCallback, useState } from "react";
import useResizeObserver from "@refactor/hooks/useResizeObserver";
import Text from "@refactor/components/Text";
import AccountAddress from "@refactor/components/AccountAddress";
import { useWalletProvider } from "@refactor/providers/WalletProvider";
import useSelectedAccount from "@refactor/hooks/useSelectedAccount";
import { useMetaMaskWallet } from "@refactor/providers/MetaMaskWalletProvider";

const bem = createBEMHelper(require("./ProfileHero.module.scss"));

type ComponentProps = {};

export default function ProfileHero({
	className,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const { selectedWallet } = useWalletProvider();
	const { selectedAccount: metaMaskAccount } = useMetaMaskWallet();
	const selectedAccount = useSelectedAccount();
	const [iconScale, setIconScale] = useState<number>(0);
	const onResize = useCallback(
		(entries: ResizeObserverEntry[], target: HTMLDivElement) => {
			if (!entries?.length) return;
			const clientRect = target.getBoundingClientRect();

			setIconScale(((clientRect?.height || 256) / 256) * 1.25);
		},
		[]
	);
	const accountRef = useResizeObserver<HTMLDivElement>(onResize);

	return (
		<div className={bem("root", className)} {...props}>
			<div className={bem("inner")}>
				<div className={bem("graphic")}></div>
				<div
					className={bem("account")}
					ref={accountRef}
					style={{ "--icon-scale": iconScale } as any}>
					{!!selectedAccount && (
						<>
							<Identicon
								value={selectedAccount.address}
								theme="beachball"
								size={256}
								className={bem("accountIcon")}
							/>

							<div className={bem("accountInfo")}>
								<Text variant="headline4" className={bem("accountName")}>
									{selectedAccount?.meta?.name ?? "METAMASK"}
								</Text>
								<Text variant="headline6">
									<AccountAddress
										address={
											selectedWallet === "CENNZnet"
												? selectedAccount.address
												: metaMaskAccount.address
										}
										length={selectedWallet === "CENNZnet" ? 8 : 6}
									/>
								</Text>
							</div>
						</>
					)}
				</div>
				<div className={bem("bio")}></div>
			</div>
		</div>
	);
}
