import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import Link from "@refactor/components/Link";
import LithoSVG from "@refactor/assets/vectors/litho-logo.svg";

const bem = createBEMHelper(require("./Footer.module.scss"));

type ComponentProps = {};

export default function Footer({
	className,
	...props
}: DOMComponentProps<ComponentProps, "footer">) {
	return (
		<footer {...props} className={bem("footer", className)}>
			<nav className={bem("navLeft")}>
				<Link href="/" className={bem("logo")}>
					<LithoSVG />
				</Link>
				<Link
					href="https://cennz.net/privacy-policy/"
					className={bem("navLeftItem")}>
					Privacy Policy
				</Link>
				<Link
					href="https://litho.a2hosted.com/terms-of-use/"
					className={bem("navLeftItem")}>
					Terms of use
				</Link>
			</nav>

			<nav className={bem("navRight")}>
				<Link
					href="https://twitter.com/Lithoverse"
					className={bem("navRightItem")}>
					Twitter
				</Link>
				<Link
					href="https://www.instagram.com/lithoverse/"
					className={bem("navRightItem")}>
					Instagram
				</Link>
				<Link
					href="https://discord.gg/cVxUnGC8DU"
					className={bem("navRightItem")}>
					Discord
				</Link>
			</nav>
		</footer>
	);
}
