import { Api } from "@cennznet/api";
import {
	NFTAttributes,
	NFTMetadata,
	NFTId,
	NFTAttribute,
	NFTData,
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
	let attributes: NFTAttributes = null,
		metadata: NFTMetadata = null;
	const tokenInfo = await api.derive.nft.tokenInfo(tokenId as any);

	attributes = (tokenInfo.attributes as any)
		.toJSON()
		.filter((attribute: NFTAttribute) => !!attribute.Text);

	const { Url: metadataIPFS } =
		(tokenInfo.attributes as any)
			.toJSON()
			.find(
				(attribute: NFTAttribute) =>
					attribute.Url && attribute.Url.search(/metadata/gi) >= 0
			) || {};

	const data = {
		owner: tokenInfo.owner,
	};

	if (!metadataIPFS) return null;

	const metadataIPFSUrl = getPinataUrl(metadataIPFS);
	if (!metadataIPFSUrl) return { ...data, attributes, metadata };

	metadata = await fetch(metadataIPFSUrl).then((response) => response?.json());

	if (!metadata?.image) return null;

	// older NFTs created with Litho incorrectly set this field as "owner"
	if (metadata?.properties?.owner) {
		metadata.properties.creator = metadata.properties.owner;
		delete metadata.properties.owner;
	}

	let imageIPFSUrl: string;

	imageIPFSUrl = metadata.image = getImageKitUrl(metadata.image);

	return { ...data, attributes, metadata, metadataIPFSUrl, imageIPFSUrl };
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
