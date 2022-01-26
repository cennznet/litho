import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { DOMComponentProps, SortOrder } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { useCallback, useEffect, useState } from "react";
import fetchOpenListingIds from "@refactor/utils/fetchOpenListingIds";
import Text from "@refactor/components/Text";
import ListingGrid from "@refactor/components/ListingGrid";
import Dropdown from "@refactor/components/Dropdown";

const bem = createBEMHelper(require("./MarketplaceGrid.module.scss"));

type ComponentProps = {
	chunkSize?: number;
};

export default function MarketplaceGrid({
	className,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const api = useCENNZApi();
	const [listingIds, setListingIds] = useState<Array<number>>(
		new Array(12).fill(0)
	);
	const [sortedListingIds, setSortedListingIds] = useState<Array<number>>([]);
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

	useEffect(() => {
		if (!listingIds?.length || !sortOrder) return;
		setSortedListingIds([
			...listingIds.sort((a, b) => (sortOrder === "ASC" ? a - b : b - a)),
		]);
	}, [listingIds, sortOrder]);

	const onDropdownChange = useCallback((event) => {
		setSortOrder(event.target.value);
	}, []);

	return (
		<div className={bem("root", className)} {...props}>
			<ListingGrid listingIds={sortedListingIds}>
				<div className={bem("header")}>
					<Text variant="headline3">Marketplace Collections</Text>
					<Dropdown
						className={bem("sortDropdown")}
						defaultLabel="Newest First"
						defaultValue={sortOrder}
						value={sortOrder}
						onChange={onDropdownChange}>
						<option value="DESC">Newest First</option>
						<option value="ASC">Oldest First</option>
					</Dropdown>
				</div>
			</ListingGrid>
		</div>
	);
}
