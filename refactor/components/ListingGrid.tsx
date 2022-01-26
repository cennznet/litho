import { DOMComponentProps, CollectionTupple } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import ListingCard from "@refactor/components/ListingCard";

const bem = createBEMHelper(require("./ListingGrid.module.scss"));

type ComponentProps = {
	listingIds: Array<number | CollectionTupple>;
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

			<div className={bem("list")}>
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
