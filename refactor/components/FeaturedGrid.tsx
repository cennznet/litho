import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import ListingGrid from "@refactor/components/ListingGrid";
import Text from "@refactor/components/Text";

const bem = createBEMHelper(require("./FeaturedGrid.module.scss"));

type ComponentProps = {
	listingIds: Array<number>;
};

export default function FeaturedGrid({
	className,
	listingIds,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	return (
		<div className={bem("root", className)} {...props}>
			<ListingGrid listingIds={listingIds}>
				<Text variant="headline3">
					{process.env.NEXT_PUBLIC_FEATURED_COLLECTION_TITLE ||
						"Featured Collection"}
				</Text>
			</ListingGrid>
		</div>
	);
}
