import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { useEffect, useState } from "react";
import styles from "./AccountAddress.module.scss";
const bem = createBEMHelper(styles);

type ComponentProps = {
	address: string;
	length?: number;
};

export default function AccountAddress({
	className,
	address,
	length = 4,
	...props
}: DOMComponentProps<ComponentProps, "span">) {
	const [displayAddress, setDisplayAddress] = useState<string>();

	useEffect(() => {
		if (!address || !length) return;
		if (length >= address.length / 2) return setDisplayAddress(address);
		setDisplayAddress(
			`${address.substr(0, length)}...${address.substr(-length)}`
		);
	}, [address, length]);

	return (
		<span className={bem("root", className)} title={address}>
			{displayAddress}
		</span>
	);
}
