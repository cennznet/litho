import { DOMComponentProps } from "@refactor/custom";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import styles from "./Footer.module.scss";
const bem = createBEMHelper(styles);

type FooterProps = {};

export default function Footer({
	className,
	children,
	...props
}: DOMComponentProps<FooterProps, "footer">) {
	return (
		<footer {...props} className={bem("footer", className)}>
			{children}
		</footer>
	);
}
