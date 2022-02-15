import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import Identicon from "@polkadot/react-identicon";
import { useCallback, useState } from "react";
import useResizeObserver from "@refactor/hooks/useResizeObserver";
import Text from "./Text";
import AccountAddress from "./AccountAddress";

const bem = createBEMHelper(require("./ProfileHero.module.scss"));

type ComponentProps = {};

export default function ProfileHero({
	className,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const { account } = useWallet();
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
					{!!account && (
						<>
							<Identicon
								value={account.address}
								theme="beachball"
								size={256}
								className={bem("accountIcon")}
							/>

							<div className={bem("accountInfo")}>
								<Text variant="headline4" className={bem("accountName")}>
									{account.meta.name}
								</Text>
								<Text variant="headline6">
									<AccountAddress address={account.address} length={8} />
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
