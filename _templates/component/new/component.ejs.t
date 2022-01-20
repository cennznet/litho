---
to: "refactor/components/<%= name %>.tsx"
---
import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";

const bem = createBEMHelper(require("./<%= name %>.module.scss"));

type ComponentProps = {};

export default function <%= name %>({className, ...props}: DOMComponentProps<ComponentProps, "div">) {
	return <div className={bem("root", className)} {...props} />;
}