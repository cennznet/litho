import { Api } from "@cennznet/api";
import {
	NFTAttributes,
	NFTListing,
	NFTMetadata,
	NFTIdTuple,
} from "@refactor/types";
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

	const tokenId = listing.tokens[0].toJSON() as NFTIdTuple;
	const { attributes, metadata } = await fetchNFT(api, tokenId);

	return attributes && metadata
		? {
				listingId,
				type: response.isFixedPrice ? "Fixed Price" : "Auction",
				price: price.toJSON(),
				paymentAssetId: listing.paymentAsset.toJSON(),
				token: {
					tokenId,
					attributes,
					metadata,
				},
		  }
		: null;
}

/**
 * Fetches NFT `attributes` and `metadata`
 *
 * @param {Api} api
 * @param {NFTTokenTuple} tokenId
 * @return {Promise<{attributes: NFTAttributes, metadata: NFTMetadata}>}
 */
export async function fetchNFT(
	api: Api,
	tokenId: NFTIdTuple
): Promise<{ attributes: NFTAttributes; metadata: NFTMetadata }> {
	let attributes: NFTAttributes = null,
		metadata: NFTMetadata = null;
	const tokenInfo = await api.derive.nft.tokenInfo(tokenId as any);

	attributes = (tokenInfo.attributes as any)
		.toJSON()
		.filter((attribute) => !!attribute.Text);
	const { Url: metadataIPFS } = (tokenInfo.attributes as any)
		.toJSON()
		.find(
			(attribute) => attribute.Url && attribute.Url.search(/metadata/gi) >= 0
		);

	if (!metadataIPFS) return { attributes, metadata };

	const metadataUrl = getImageKitUrl(metadataIPFS);
	if (!metadataUrl) return { attributes, metadata };

	metadata = await fetch(metadataUrl).then((response) => response?.json());

	// older NFTs created with Litho incorrectly set this field as "owner"
	if (metadata?.properties?.owner) {
		metadata.properties.creator = metadata.properties.owner;
		delete metadata.properties.owner;
	}

	// transform image IPFS link also
	if (metadata?.image) {
		metadata.image = getImageKitUrl(metadata.image);
	}

	return { attributes, metadata };
}

export function getImageKitUrl(text: string): string {
	const matches = text.match(/ipfs:\/\/(.*)/i);
	if (!matches?.[1]) return null;

	return `${process.env.NEXT_PUBLIC_IMAGE_CDN}/ipfs/${matches[1]}`;
}

export function getPinataUrl(text: string): string {
	const matches = text.match(/ipfs:\/\/(.*)/i);
	if (!matches?.[1]) return null;

	return `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${matches[1]}`;
}

// export function getImageKitUrl(text: string): string {
// 	const [, hash] = text.match(/ipfs:\/\/(.*)/i);
// 	if (!hash) return null;

// 	return `${process.env.NEXT_PUBLIC_IMAGE_CDN}/ipfs/${hash}`;
// }
