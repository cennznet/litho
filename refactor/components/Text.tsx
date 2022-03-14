import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";

const bem = createBEMHelper(require("./Text.module.scss"));

type ComponentProps = {
	variant:
		| "headline1"
		| "headline2"
		| "headline3"
		| "headline4"
		| "headline5"
		| "headline6"
		| "subtitle1"
		| "subtitle2"
		| "body1"
		| "body2";
};

export default function Text({
	className,
	variant,
	children,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	return (
		<div className={bem("root", { [variant]: true }, className)} {...props}>
			{children}
		</div>
	);
}
