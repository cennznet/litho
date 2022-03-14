import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";

const bem = createBEMHelper(require("./ThreeDots.module.scss"));

type ComponentProps = {};

export default function ThreeDots({
	className,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	return (
		<div className={bem("root", className)} {...props}>
			<span>.</span>
			<span>.</span>
			<span>.</span>
		</div>
	);
}
