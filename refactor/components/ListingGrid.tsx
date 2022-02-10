import { DOMComponentProps, NFTListingTuple, NFTId } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import ListingCard, { NFTCard } from "@refactor/components/ListingCard";

const bem = createBEMHelper(require("./ListingGrid.module.scss"));

type ComponentProps = {
	listingIds: Array<number | NFTListingTuple>;
};

export default function ListingGrid({
	className,
	children,
	listingIds,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	return (
		<div className={bem("root", className)} {...props}>
			{!!children && <div className={bem("header")}>{children}</div>}

			<div className={bem("list", { asStack: Array.isArray(listingIds?.[0]) })}>
				{listingIds.map((id, index) => {
					return (
						<ListingCard
							listingId={id}
							key={Array.isArray(id) ? id[1] : id || index}
							className={bem("item")}
						/>
					);
				})}
			</div>
		</div>
	);
}

type NFTGridProps = {
	tokenIds: Array<NFTId>;
};
export function NFTGrid({
	className,
	children,
	tokenIds,
	...props
}: DOMComponentProps<NFTGridProps, "div">) {
	return (
		<div className={bem("root", className)} {...props}>
			{!!children && <div className={bem("header")}>{children}</div>}
			<div className={bem("list")}>
				{tokenIds.map((id, index) => {
					return (
						<NFTCard
							tokenId={id}
							key={id ? id.join("/") : index}
							className={bem("item")}
						/>
					);
				})}
			</div>
		</div>
	);
}
