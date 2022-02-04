import { useEffect, useState } from "react";
import { NFTData, NFTListing, NFTListingId } from "@refactor/types";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import fetchListingItem from "@refactor/utils/fetchListingItem";
import fetchNFTData from "@refactor/utils/fetchNFTData";

type ListingItem = NFTData & Partial<NFTListing>;

export default function useNFTListing(
	listingId: NFTListingId,
	shouldFetch: boolean = true,
	defaultItem: ListingItem = null
): [ListingItem, boolean] {
	const api = useCENNZApi();
	const [item, setItem] = useState<ListingItem>(defaultItem);
	const [busy, setBusy] = useState<boolean>(!shouldFetch);

	useEffect(() => {
		if (!api || !listingId || !shouldFetch) return;

		async function fetchListing() {
			const listing = await fetchListingItem(api, listingId);
			const data = await fetchNFTData(api, listing.tokenId);

			setItem(data?.metadata ? { ...listing, ...data } : null);
			setBusy(false);
		}

		fetchListing();
	}, [api, listingId, shouldFetch]);

	return [item, busy];
}
