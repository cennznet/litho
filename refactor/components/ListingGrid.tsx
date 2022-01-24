import { DOMComponentProps, NFTListing } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import ListingCard from "@refactor/components/ListingCard";

const bem = createBEMHelper(require("./ListingGrid.module.scss"));

type ComponentProps = {
	items: Array<NFTListing>;
};

export default function ListingGrid({
	className,
	children,
	items,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	return (
		<div className={bem("root", className)} {...props}>
			{!!children && <div className={bem("header")}>{children}</div>}

			<ul className={bem("list")}>
				{items.map((item, index) => (
					<li key={index} className={bem("item")}>
						<ListingCard {...item} />
					</li>
				))}
			</ul>
		</div>
	);
}
