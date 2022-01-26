import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import ListingCard from "@refactor/components/ListingCard";

const bem = createBEMHelper(require("./ListingGrid.module.scss"));

type ComponentProps = {
	listingIds: Array<number>;
	showSpinner?: boolean;
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
						<ListingCard listingId={id} key={index} className={bem("item")} />
					);
				})}
			</div>
		</div>
	);
}
