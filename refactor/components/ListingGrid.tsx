import { DOMComponentProps, NFTListing } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import ListingCard from "@refactor/components/ListingCard";
import Link from "@refactor/components/Link";
import Spinner from "@refactor/components/Spinner";

const bem = createBEMHelper(require("./ListingGrid.module.scss"));

type ComponentProps = {
	items: Array<NFTListing>;
	showSpinner?: boolean;
};

export default function ListingGrid({
	className,
	children,
	items,
	showSpinner,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	return (
		<div className={bem("root", className)} {...props}>
			{!!children && <div className={bem("header")}>{children}</div>}

			<ul className={bem("list")}>
				{items.map((item, index) => {
					const {
						token: {
							tokenId,
							metadata: { name },
						},
					} = item;
					return (
						<li key={index} className={bem("item")}>
							<Link href={`/nft/${tokenId.join("/")}`} title={name}>
								<ListingCard value={item} />
							</Link>
						</li>
					);
				})}
			</ul>

			{showSpinner && (
				<div className={bem("loading")}>
					<Spinner className={bem("spinner")} />
				</div>
			)}
		</div>
	);
}
