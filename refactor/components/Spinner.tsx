import { DOMComponentProps } from "@refactor/types";
import { ReactComponent as SpinnerSVG } from "@refactor/assets/vectors/spinner.svg";
import createBEMHelper from "@refactor/utils/createBEMHelper";

import styles from "./Spinner.module.scss";
const bem = createBEMHelper(styles);

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
