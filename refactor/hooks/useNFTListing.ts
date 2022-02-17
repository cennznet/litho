import { useCallback, useState } from "react";
import { NFTData, NFTListing, NFTListingId, NFTId } from "@refactor/types";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import fetchListingItem from "@refactor/utils/fetchListingItem";
import fetchNFTData from "@refactor/utils/fetchNFTData";
import findListingIdByTokenId from "@refactor/utils/findListingIdByTokenId";
import isFinite from "lodash/isFinite";

type ListingItem = NFTData & Partial<NFTListing>;

export default function useNFTListing(defaultItem: ListingItem = null): {
	item: ListingItem;
	fetchByListingId: (
		listingId: NFTListingId,
		callback?: (item: ListingItem) => void
	) => Promise<void>;
	fetchByTokenId: (
		tokenId: NFTId,
		callback?: (item: ListingItem) => void
	) => Promise<void>;
} {
	const api = useCENNZApi();
	const [item, setItem] = useState<ListingItem>(defaultItem);

	const fetchByListingId = useCallback(
		async (listingId: NFTListingId, callback?: (item: ListingItem) => void) => {
			if (!api || !isFinite(listingId)) return;
			const listing = await fetchListingItem(api, listingId);
			const data = listing ? await fetchNFTData(api, listing.tokenId) : null;

			const item = data?.metadata ? { ...listing, ...data } : null;
			callback?.(item);
			setItem(item);
		},
		[api]
	);

	const fetchByTokenId = useCallback(
		async (tokenId: NFTId, callback?: (item: ListingItem) => void) => {
			if (!api || !tokenId) return;
			const data = await fetchNFTData(api, tokenId);
			const listingId = await findListingIdByTokenId(api, tokenId);
			const listing = isFinite(listingId)
				? await fetchListingItem(api, listingId)
				: null;

			const item = data?.metadata ? { ...listing, ...data } : null;
			callback?.(item);
			setItem(item);
		},
		[api]
	);

	return { item, fetchByListingId, fetchByTokenId };
}
