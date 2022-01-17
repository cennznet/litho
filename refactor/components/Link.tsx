import clsx from "clsx";
import { DOMComponentProps } from "@refactor/types";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { useRouter } from "next/router";

type LinkProps = {
	activeClassName?: string;
};
/* eslint-disable react/jsx-no-target-blank */
export default function Link({
	className,
	activeClassName,
	href,
	children,
	...props
}: DOMComponentProps<LinkProps & NextLinkProps, "a">) {
	if (!href) href = "#";
	const internal = /^\/(?!\/)/.test(href) || (href && href.indexOf("#") === 0);
	const { asPath = "/" } = useRouter() || {};

	if (!internal) {
		const nofollow = /lithoverse\.xyz/.test(href)
			? null
			: { rel: "nofollow noreferrer" };
		return (
			<a
				{...props}
				href={href}
				{...nofollow}
				target={href.indexOf("mailto:") === 0 ? "_self" : "_blank"}
				className={clsx(className, asPath === href && activeClassName)}>
				{children}
			</a>
		);
	}

	return (
		<NextLink href={href} passHref>
			<a
				{...props}
				className={clsx(className, asPath === href && activeClassName)}>
				{children}
			</a>
		</NextLink>
	);
}
