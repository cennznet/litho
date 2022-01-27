import { Api } from "@cennznet/api";
import { NFTListing, NFTIdTuple } from "@refactor/types";
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
	const response: Listing = (
		(await api.query.nft.listings(listingId)) as any
	).unwrapOrDefault();

	const listing: FixedPriceListing | AuctionListing = response.isFixedPrice
		? response.asFixedPrice
		: response.asAuction;

	const price: Balance = response.isFixedPrice
		? (listing as FixedPriceListing).fixedPrice
		: (listing as AuctionListing).reservePrice;

	const tokenId = listing.tokens?.[0].toJSON() as NFTIdTuple;

	return {
		listingId,
		tokenId,
		type: response.isFixedPrice ? "Fixed Price" : "Auction",
		price: price.toJSON(),
		paymentAssetId: listing.paymentAsset.toJSON(),
	};
}
