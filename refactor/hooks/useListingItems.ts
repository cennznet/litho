import { useEffect, useState, useMemo, useCallback } from "react";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { NFTListing, SortOrder } from "@refactor/types";
import { fetchListingItem } from "@refactor/utils/fetchOpenListings";
import { Bool } from "@polkadot/types";

/**
 *
 *
 * @param {number} chunkSize
 * @param {SortOrder} sortOrder
 * @param {Array<number>} listingIds
 * @return {Array<NFTListing>}
 */
export default function useListingItems(
	listingIds: Array<number>,
	chunkSize: number,
	sortOrder: SortOrder = "DESC"
): Array<NFTListing> {
	const api = useCENNZApi();
	const [listingItems, setListingItems] = useState<Array<NFTListing>>([]);
	const [sortedListingIds, setSortedListingIds] = useState<Array<number>>([]);

	useEffect(() => {
		setListingItems([]);
	}, [listingIds]);

	useEffect(() => {
		if (!listingIds?.length || !sortOrder) return;
		setSortedListingIds(
			listingIds.sort((a, b) => (sortOrder === "ASC" ? a - b : b - a))
		);
	}, [sortOrder, listingIds]);

	const [chunk, nextChunk] = useChunkedArray<number>(
		chunkSize,
		sortedListingIds
	);

	useEffect(() => {
		if (!chunk?.length) return;

		async function fetchChunk() {
			const listingItems = (
				await Promise.all(
					chunk.map((listingId) => fetchListingItem(api, listingId))
				)
			).filter(Boolean);

			setListingItems((prev) => [...prev, ...listingItems]);
			nextChunk();
		}

		fetchChunk();
	}, [api, chunk, nextChunk, chunkSize]);

	return listingItems;
}

function useChunkedArray<T>(
	chunkSize: number,
	value: Array<T>
): [Array<T>, () => void] {
	const chunkedArray = useMemo(
		() =>
			Array.from({ length: Math.ceil(value.length / chunkSize) }, (v, i) =>
				value.slice(i * chunkSize, i * chunkSize + chunkSize)
			),
		[chunkSize, value]
	);

	const [pointer, setPointer] = useState<number>(0);

	useEffect(() => {
		setPointer(0);
	}, [chunkedArray?.length]);

	const chunk = useMemo(
		() => (pointer < chunkedArray.length ? chunkedArray[pointer] : []),
		[pointer, chunkedArray]
	);

	const nextChunk = useCallback(() => setPointer((pointer) => pointer + 1), []);

	return [chunk, nextChunk];
}
