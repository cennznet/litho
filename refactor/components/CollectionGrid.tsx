import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { DOMComponentProps, SortOrder, NFTListingTuple } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { useCallback, useEffect, useState } from "react";
import fetchOpenListingIds from "@refactor/utils/fetchOpenListingIds";
import Text from "@refactor/components/Text";
import ListingGrid from "@refactor/components/ListingGrid";
import Dropdown from "@refactor/components/Dropdown";
import fetchLatestOpenListingIds from "@refactor/utils/fetchLatestOpenListingIds";
import isFinite from "lodash/isFinite";

const bem = createBEMHelper(require("./CollectionGrid.module.scss"));

type ComponentProps = {
	headline: string;
	collectionId?: number;
	defaultListingIds?: Array<number | NFTListingTuple>;
};

export default function CollectionGrid({
	className,
	headline,
	collectionId,
	defaultListingIds = [],
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const api = useCENNZApi();
	const [listingIds, setListingIds] =
		useState<Array<number | NFTListingTuple>>(defaultListingIds);
	const [sortedListingIds, setSortedListingIds] = useState<
		Array<NFTListingTuple>
	>([]);
	const [sortOrder, setSortOrder] = useState<SortOrder>("DESC");

	useEffect(() => {
		if (!api) return;

		async function fetchAllListings() {
			const listingIds = !isFinite(collectionId)
				? await fetchLatestOpenListingIds(api)
				: await fetchOpenListingIds(api, collectionId);
			setListingIds(listingIds);
		}

		fetchAllListings();
	}, [api, collectionId]);

	useEffect(() => {
		if (!listingIds?.length || !sortOrder) return;
		const sortedListingIds = [
			...listingIds.sort(
				(a: number | NFTListingTuple, b: number | NFTListingTuple) => {
					const left: number = Array.isArray(a) ? a[1] : a;
					const right: number = Array.isArray(b) ? b[1] : b;
					return sortOrder === "ASC" ? left - right : right - left;
				}
			),
		];

		setSortedListingIds(sortedListingIds as Array<NFTListingTuple>);
	}, [listingIds, sortOrder]);

	const onDropdownChange = useCallback((event) => {
		setSortOrder(event.target.value);
	}, []);

	return (
		<div className={bem("root", className)} {...props}>
			<ListingGrid listingIds={sortedListingIds}>
				<div className={bem("header")}>
					<Text variant="headline3">{headline}</Text>
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

				{!sortedListingIds?.length && (
					<div className={bem("message")}>
						<Text variant="headline6" className={bem("headline")}>
							No listings available in this collection.
						</Text>
					</div>
				)}
			</ListingGrid>
		</div>
	);
}
