import { ComponentPropsWithRef, PropsWithChildren, Context } from "react";

export type DOMComponentProps<T, E> = PropsWithChildren<T> &
	ComponentPropsWithRef<E>;

declare module "*.svg" {
	import React = require("react");
	export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
	const src: string;
	export default src;
}
