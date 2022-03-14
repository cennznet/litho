import clsx from "clsx";
import { bemModule } from "@jahed/bem";

/**
 * Create a simple helper function to help using the `stylesObject`
 * in BEM way
 *
 * @param {{[key: string]: string;}} styles
 * @return {(block:string, modifiers:{[key:string]:boolean}, ...args:string[])=>string}
 */
export default function createBEMHelper(styles: {
	[key: string]: string;
}): (
	block: string,
	modifiers?: { [key: string]: boolean } | string,
	...args: string[]
) => string {
	const bem = bemModule(styles);
	return (block, modifiers, ...args) =>
		typeof modifiers !== "string"
			? clsx(bem(block, modifiers), ...args)
			: clsx(bem(block), modifiers, ...args);
}
