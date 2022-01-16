import createBEMHelper from "@refactor/utils/createBEMHelper";
import { DOMComponentProps } from "@refactor/custom";
import styles from "./Main.module.scss";
const bem = createBEMHelper(styles);

type MainProps = {};

export default function Main({
	className,
	children,
	...props
}: DOMComponentProps<MainProps, "main">) {
	return (
		<main {...props} className={bem("main", className)}>
			{children}
		</main>
	);
}
