import { DOMComponentProps, NFTListing } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import NFTRenderer from "@refactor/components/NFTRenderer";

const bem = createBEMHelper(require("./ListingCard.module.scss"));

type ComponentProps = {} & NFTListing;

export default function ListingCard({
	className,
	listingId,
	token,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	return (
		<div className={bem("root", className)} {...props}>
			<div className={bem("renderer")}>
				<NFTRenderer token={token} />
			</div>
		</div>
	);
}
