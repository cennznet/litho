import { useCallback, useState } from "react";
import { NFTData, NFTListing, NFTListingId, NFTId } from "@refactor/types";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import fetchListingItem from "@refactor/utils/fetchListingItem";
import fetchNFTData from "@refactor/utils/fetchNFTData";

type ListingItem = NFTData & Partial<NFTListing>;

export default function useNFTListing(
	listingId: NFTListingId,
	defaultItem: ListingItem = null
): [ListingItem, (callback?: (item: ListingItem) => void) => Promise<void>] {
	const api = useCENNZApi();
	const [item, setItem] = useState<ListingItem>(defaultItem);

	const fetchListing = useCallback(
		async (callback) => {
			if (!api || !listingId) return;
			const listing = await fetchListingItem(api, listingId);
			const data = listing ? await fetchNFTData(api, listing.tokenId) : null;

			const item = data?.metadata ? { ...listing, ...data } : null;
			callback?.(item);
			setItem(item);
		},
		[api, listingId]
	);

	return [item, fetchListing];
}

export function useNFTData(
	tokenId: NFTId,
	defaultItem: NFTData = null
): [NFTData, (callback?: (item: NFTData) => void) => Promise<void>] {
	const api = useCENNZApi();
	const [item, setItem] = useState<ListingItem>(defaultItem);

	const fetchData = useCallback(
		async (callback) => {
			if (!api || !tokenId) return;
			const data = await fetchNFTData(api, tokenId);

			callback?.(data);
			setItem(data);
		},
		[api, tokenId]
	);

	return [item, fetchData];
}
