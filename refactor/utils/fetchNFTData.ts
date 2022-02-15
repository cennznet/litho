import { Api } from "@cennznet/api";
import {
	NFTAttributes,
	NFTMetadata,
	NFTId,
	NFTAttribute,
	NFTData,
	NFTMetadata271,
} from "@refactor/types";

/**
 * Fetches NFT `attributes` and `metadata`
 *
 * @param {Api} api
 * @param {NFTTokenTuple} tokenId
 * @return {Promise<NFTData>}
 */
export default async function fetchNFTData(
	api: Api,
	tokenId: NFTId
): Promise<NFTData> {
	if (!tokenId) return;

	const info = await fetchNFTInfo(api, tokenId);

	if (!info?.metadata?.image) return null;

	return {
		tokenId,
		owner: (
			await api.query.nft.tokenOwner([tokenId[0], tokenId[1]], tokenId[2])
		).toString(),
		...info,
	};
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

export async function fetchNFTInfo(
	api: Api,
	tokenId: NFTId
): Promise<{
	metadata: NFTMetadata;
	attributes: NFTAttributes;
	metadataIPFSUrl?: string;
	imageIPFSUrl?: string;
}> {
	const seriesAttributes = (
		await api.query.nft.seriesAttributes(tokenId[0], tokenId[1])
	).toJSON() as Array<any>;

	let metadata: NFTMetadata = null,
		attributes: NFTAttributes = null,
		metadataIPFSUrl: string = null,
		imageIPFSUrl: string = null;

	// Retrieve and return data using the old format
	if (seriesAttributes.length) {
		attributes = seriesAttributes.filter(
			(attribute: NFTAttribute) => !!attribute.text
		);

		const { url: metadataIPFS } =
			seriesAttributes.find(
				(attribute: NFTAttribute) =>
					attribute.url && attribute.url.search(/metadata/gi) >= 0
			) || {};

		if (!metadataIPFS) return { metadata, attributes };

		metadataIPFSUrl = getPinataUrl(metadataIPFS);
		if (!metadataIPFSUrl) return { metadata, attributes };

		metadata = await fetch(metadataIPFSUrl).then((response) =>
			response?.json()
		);

		if (!metadata?.image) return { metadata, attributes };

		// older NFTs created with Litho incorrectly set this field as "owner"
		if (metadata?.properties?.owner) {
			metadata.properties.creator = metadata.properties.owner;
			delete metadata.properties.owner;
		}

		imageIPFSUrl = getPinataUrl(metadata.image);
		metadata.image = getImageKitUrl(metadata.image);

		return { metadata, attributes, metadataIPFSUrl, imageIPFSUrl };
	}

	// Retrieve and return data using the new format
	const metadataUri = (
		await api.query.nft.seriesMetadataURI(tokenId[0], tokenId[1])
	).toHuman() as string;

	metadataIPFSUrl = `${getPinataUrl(metadataUri)}/${tokenId[2]}.json`;

	const rawMetadata = (await fetch(metadataIPFSUrl).then((response) =>
		response?.json()
	)) as NFTMetadata271;

	metadata = {
		name: rawMetadata.name,
		description: rawMetadata.description,
		image: getImageKitUrl(rawMetadata.image),
		properties: {
			quantity: rawMetadata.quantity,
			creator: rawMetadata.creator,
			extension:
				rawMetadata.encoding_format.indexOf("video/") === 0 ? "mp4" : "jpg",
		},
	};

	attributes = rawMetadata.attributes.reduce(
		(attributes, { trait_type, value }) => {
			attributes.push({ [trait_type]: value });
			return attributes;
		},
		[] as NFTAttributes
	);

	console.log(attributes);

	imageIPFSUrl = getPinataUrl(rawMetadata.image);

	return { metadata, attributes, metadataIPFSUrl, imageIPFSUrl };
}
