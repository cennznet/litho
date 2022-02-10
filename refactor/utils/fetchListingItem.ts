import { Api } from "@cennznet/api";
import { NFTListing, NFTId } from "@refactor/types";
import {
	AuctionListing,
	FixedPriceListing,
	Listing,
	Balance,
} from "@cennznet/types";

/**
 * Fetch an NFT from a `listingId`
 *
 * @param {Api} api
 * @param {number} listingId
 * @return {Promise<NFTListing>}
 */
export default async function fetchListingItem(
	api: Api,
	listingId: number
): Promise<NFTListing> {
	if (!listingId) return;

	const response: Listing = (
		(await api.query.nft.listings(listingId)) as any
	).unwrapOrDefault();

	const listing: FixedPriceListing | AuctionListing = response.isFixedPrice
		? response.asFixedPrice
		: response.asAuction;

	const price: Balance = response.isFixedPrice
		? (listing as FixedPriceListing).fixedPrice
		: (listing as AuctionListing).reservePrice;

	const tokenId = listing.tokens?.[0]?.toJSON() as NFTId;

	const royalty =
		listing?.royaltiesSchedule?.entitlements?.toJSON()?.[0]?.[1] || null;

	const winningBid = !response.isFixedPrice
		? ((await api.query.nft.listingWinningBid(listingId)) as any)
				.unwrapOrDefault()
				.toJSON()
		: null;

	return tokenId
		? {
				listingId,
				tokenId,
				closeBlock: listing?.close?.toJSON(),
				type: response.isFixedPrice ? "Fixed Price" : "Auction",
				price: price.toJSON(),
				paymentAssetId: listing.paymentAsset.toJSON(),
				royalty,
				winningBid,
				buyer: (listing as any)?.buyer?.toJSON?.() || null,
		  }
		: null;
}
