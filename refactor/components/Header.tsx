import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import styles from "./Header.module.scss";
const bem = createBEMHelper(styles);

type HeaderProps = {};

export default function Header({
	className,
	children,
	...props
}: DOMComponentProps<HeaderProps, "header">) {
	return (
		<header {...props} className={bem("header", className)}>
			{children}
		</header>
	);
}
