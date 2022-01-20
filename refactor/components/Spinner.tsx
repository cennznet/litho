import { DOMComponentProps } from "@refactor/types";
import { ReactComponent as SpinnerSVG } from "@refactor/assets/vectors/spinner.svg";
import createBEMHelper from "@refactor/utils/createBEMHelper";

const bem = createBEMHelper(require("./Spinner.module.scss"));

type ComponentProps = {};

export default function Spinner({
	className,
	...props
}: DOMComponentProps<ComponentProps, "span">) {
	return (
		<span className={bem("root", className)} {...props}>
			<SpinnerSVG />
		</span>
	);
}
