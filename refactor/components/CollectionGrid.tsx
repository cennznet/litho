import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import {
	DOMComponentProps,
	SortOrder,
	CollectionTupple,
} from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { useCallback, useEffect, useState } from "react";
import fetchOpenListingIds from "@refactor/utils/fetchOpenListingIds";
import Text from "@refactor/components/Text";
import ListingGrid from "@refactor/components/ListingGrid";
import Dropdown from "@refactor/components/Dropdown";
import { fetchLatestOpenListingIds } from "@refactor/utils/fetchOpenListingIds";

const bem = createBEMHelper(require("./CollectionGrid.module.scss"));

type ComponentProps = {
	headline: string;
	collectionId?: number;
	defaultListingIds?: Array<number | CollectionTupple>;
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
		useState<Array<number | CollectionTupple>>(defaultListingIds);
	const [sortedListingIds, setSortedListingIds] = useState<
		Array<CollectionTupple>
	>([]);
	const [sortOrder, setSortOrder] = useState<SortOrder>("DESC");

	useEffect(() => {
		if (!api) return;

		async function fetchAllOpenListings() {
			const listingIds = await fetchLatestOpenListingIds(api);
			setListingIds(listingIds);
		}

		async function fetchOpenListings() {
			const listingIds = await fetchOpenListingIds(api, collectionId);
			setListingIds(listingIds);
		}

		if (!collectionId) {
			fetchAllOpenListings();
			return;
		}

		fetchOpenListings();
	}, [api, collectionId]);

	useEffect(() => {
		if (!listingIds?.length || !sortOrder) return;
		const sortedListingIds = [
			...listingIds.sort(
				(a: number | CollectionTupple, b: number | CollectionTupple) => {
					const left: number = Array.isArray(a) ? a[1] : a;
					const right: number = Array.isArray(b) ? b[1] : b;
					return sortOrder === "ASC" ? left - right : right - left;
				}
			),
		];

		setSortedListingIds(sortedListingIds as Array<CollectionTupple>);
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
			</ListingGrid>
		</div>
	);
}
