import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import ThreeDots from "@refactor/components/ThreeDots";

const bem = createBEMHelper(require("./Button.module.scss"));

type ComponentProps = {
	variant?: "blue" | "hollow";
	showProgress?: boolean;
};

export default function Button({
	className,
	variant = "blue",
	children,
	disabled,
	showProgress = true,
	...props
}: DOMComponentProps<ComponentProps, "button">) {
	return (
		<button
			className={bem("root", { [variant]: true }, className)}
			disabled={disabled}
			{...props}>
			{children}
			{disabled && showProgress && <ThreeDots />}
		</button>
	);
}
