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
 * Fetches all NFTs from a `collectionId`
 *
 * @param {Api} api
 * @param {string} collectionId
 * @return {Promise<Array<NFTListing>>} The nft items.
 */
export default async function fetchOpenListings(
	api: Api,
	collectionId: string
): Promise<Array<NFTListing>> {
	const listings = await api.query.nft.openCollectionListings.entries(
		collectionId
	);

	return (
		await Promise.all(
			listings.map(async ([key]) => {
				const [, listingId] = key.args.map((key) => key.toHuman());
				return fetchListingItem(api, listingId as string);
			})
		)
	).filter(Boolean);
}

/**
 * Fetch an NFT from a `listingId`
 *
 * @param {Api} api
 * @param {string} listingId
 * @return {Promise<NFTListing>}
 */
export async function fetchListingItem(
	api: Api,
	listingId: string
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

	return {
		listingId,
		type: response.isFixedPrice ? "Fixed Price" : "Auction",
		price: price.toJSON(),
		paymentAssetId: listing.paymentAsset.toJSON(),
		token: {
			tokenId,
			attributes,
			metadata,
		},
	};
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

	const metadataUrl = getPinataUrl(metadataIPFS);
	if (!metadataUrl) return { attributes, metadata };

	metadata = await fetch(metadataUrl).then((response) => response?.json());

	// older NFTs created with Litho incorrectly set this field as "owner"
	if (metadata?.properties?.owner) {
		metadata.properties.creator = metadata.properties.owner;
		delete metadata.properties.owner;
	}

	// transform image IPFS link also
	if (metadata?.image) {
		metadata.image = getPinataUrl(metadata.image);
	}

	return { attributes, metadata };
}

export function getPinataUrl(text: string): string {
	const [, hash] = text.match(/ipfs:\/\/(.*)/i);
	if (!hash) return null;

	return `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${hash}`;
}

// export function getImageKitUrl(text: string): string {
// 	const [, hash] = text.match(/ipfs:\/\/(.*)/i);
// 	if (!hash) return null;

// 	return `${process.env.NEXT_PUBLIC_IMAGE_CDN}/ipfs/${hash}`;
// }
