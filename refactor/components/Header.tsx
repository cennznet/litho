import { DOMComponentProps } from "@/custom";
import createBEMHelper from "@/utils/createBEMHelper";
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
