import createBEMHelper from "@refactor/utils/createBEMHelper";
import { DOMComponentProps } from "@refactor/types";
import Header from "@refactor/components/Header";
import Footer from "@refactor/components/Footer";
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
			<Header className={bem("header")} />
			<div className={bem("content")}>{children}</div>
			<Footer className={bem("footer")} />
		</main>
	);
}
