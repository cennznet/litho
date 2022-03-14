import createBEMHelper from "@refactor/utils/createBEMHelper";
import { DOMComponentProps } from "@refactor/types";
import Header from "@refactor/components/Header";
import Footer from "@refactor/components/Footer";

const bem = createBEMHelper(require("./Main.module.scss"));

type ComponentProps = {};

export default function Main({
	className,
	children,
	...props
}: DOMComponentProps<ComponentProps, "main">) {
	return (
		<main {...props} className={bem("main", className)}>
			<div className={bem("inner")}>
				<Header className={bem("header")} />
				<div className={bem("content")}>{children}</div>
				<Footer className={bem("footer")} />
			</div>
		</main>
	);
}
