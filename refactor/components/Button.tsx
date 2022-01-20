import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";

const bem = createBEMHelper(require("./Button.module.scss"));

type ComponentProps = {
	variant?: "blue";
};

export default function Button({
	className,
	variant = "blue",
	children,
	...props
}: DOMComponentProps<ComponentProps, "button">) {
	return (
		<button className={bem("root", { [variant]: true }, className)} {...props}>
			{children}
		</button>
	);
}
