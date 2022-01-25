import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import LithoSVG from "@refactor/assets/vectors/litho-logo.svg";
import WalletButton from "@refactor/components/WalletButton";
import Link from "@refactor/components/Link";

const bem = createBEMHelper(require("./Header.module.scss"));

type ComponentProps = {};

export default function Header({
	className,
	...props
}: DOMComponentProps<ComponentProps, "header">) {
	return (
		<header {...props} className={bem("header", className)}>
			<Link href="/" className={bem("logo")}>
				<LithoSVG />
			</Link>
			<nav className={bem("nav")}>
				<Link href="https://litho.a2hosted.com" className={bem("navLink")}>
					Resources
				</Link>
				<Link
					href="/marketplace"
					className={bem("navLink")}
					activeClassName={bem("navLink", { active: true })}>
					Marketplace
				</Link>
				<Link
					href="/create"
					className={bem("navLink")}
					activeClassName={bem("navLink", { active: true })}>
					Create
				</Link>
				<WalletButton />
			</nav>
		</header>
	);
}
