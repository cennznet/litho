import createBEMHelper from "@/utils/createBEMHelper";
import { DOMComponentProps } from "@/custom";
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
