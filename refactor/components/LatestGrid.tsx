import { useState, useEffect } from "react";
import { NFTListingTuple, DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import ListingGrid from "@refactor/components/ListingGrid";
import Text from "@refactor/components/Text";
import { fetchLatestOpenListingIds } from "@refactor/utils/fetchOpenListingIds";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import Link from "@refactor/components/Link";

const bem = createBEMHelper(require("./LatestGrid.module.scss"));

type ComponentProps = {
	defaultListingIds: Array<NFTListingTuple>;
};

export default function LatestGrid({
	className,
	defaultListingIds,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const api = useCENNZApi();
	const [listingIds, setListingIds] =
		useState<Array<number | NFTListingTuple>>(defaultListingIds);

	useEffect(() => {
		if (!api) return;

		async function fetchAllOpenListings() {
			const listingIds = await fetchLatestOpenListingIds(api);
			setListingIds(listingIds);
		}

		fetchAllOpenListings();
	}, [api]);

	return (
		<div className={bem("root", className)} {...props}>
			<ListingGrid listingIds={listingIds.slice(0, 8)}>
				<div className={bem("header")}>
					<Text variant="headline3">Lastest Drops</Text>
					<Link href="/marketplace" className={bem("link")}>
						View all
					</Link>
				</div>
			</ListingGrid>
		</div>
	);
}
