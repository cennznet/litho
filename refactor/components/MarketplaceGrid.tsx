import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { DOMComponentProps, SortOrder } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { useEffect, useState } from "react";
import { fetchOpenListingIds } from "@refactor/utils/fetchOpenListings";
import useListingItems from "@refactor/hooks/useListingItems";
import Text from "@refactor/components/Text";
import ListingGrid from "@refactor/components/ListingGrid";

const bem = createBEMHelper(require("./MarketplaceGrid.module.scss"));

type ComponentProps = {
	chunkSize?: number;
};

export default function MarketplaceGrid({
	className,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const api = useCENNZApi();
	const [listingIds, setListingIds] = useState<Array<number>>([]);
	const [sortOrder, setSortOrder] = useState<SortOrder>("DESC");

	useEffect(() => {
		if (!api) return;

		async function fetchAllOpenListings() {
			const nextCollectionId = (
				await api.query.nft.nextCollectionId()
			).toJSON();
			const allPossibleCollectionIds = Array.from(
				new Array(nextCollectionId).keys()
			);

			// extract most recent listing from each collection
			// as the representative of that collection
			const listingIds = (
				await Promise.all(
					allPossibleCollectionIds.map(async (collectionId) => {
						const listingIds = await fetchOpenListingIds(api, collectionId);
						if (!listingIds?.length) return false;
						return listingIds[0];
					})
				)
			).filter(Boolean) as Array<number>;

			setListingIds(listingIds);
		}

		fetchAllOpenListings();
	}, [api]);

	const listingItems = useListingItems(listingIds, 12, sortOrder);

	return (
		<div className={bem("root", className)} {...props}>
			<ListingGrid items={listingItems} showSpinner={!listingItems?.length}>
				<Text variant="headline3">Marketplace Collections</Text>
			</ListingGrid>
		</div>
	);
}
