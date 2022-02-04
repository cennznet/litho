import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import ThreeDots from "@refactor/components/ThreeDots";

const bem = createBEMHelper(require("./Button.module.scss"));

type ComponentProps = {
	variant?: "blue";
};

export default function Button({
	className,
	variant = "blue",
	children,
	disabled,
	...props
}: DOMComponentProps<ComponentProps, "button">) {
	return (
		<button
			className={bem("root", { [variant]: true }, className)}
			disabled={disabled}
			{...props}>
			{children}
			{disabled && <ThreeDots />}
		</button>
	);
}
