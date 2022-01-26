import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";

const bem = createBEMHelper(require("./Breadcrumb.module.scss"));

type ComponentProps = {};

export default function Breadcrumb({
	className,
	children,
	...props
}: DOMComponentProps<ComponentProps, "nav">) {
	return (
		<nav className={bem("root", className)} {...props}>
			{children}
		</nav>
	);
}
