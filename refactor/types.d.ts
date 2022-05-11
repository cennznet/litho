import { ComponentPropsWithRef, PropsWithChildren } from "react";

export type DOMComponentProps<T, E> = PropsWithChildren<T> &
	ComponentPropsWithRef<E>;

export type SortOrder = "ASC" | "DESC";

export type AssetInfo = {
	assetId: number;
	symbol: string;
	decimals: number;
};

export type NFTListingType = "Auction" | "Fixed Price";

export type NFTListing = {
	listingId: number;
	tokenId: NFTId;
	closeBlock?: number;
	type: NFTListingType;
	price: number;
	winningBid?: [string, number];
	paymentAssetId: number;
	royalty?: number;
	buyer?: string;
};

export type NFTData = {
	tokenId: NFTId;
	attributes: NFTAttributes;
	metadata: NFTMetadata;
	metadataIPFSUrl?: string;
	imageIPFSUrl?: string;
	owner?: string;
};

export type NFTCollectionId = number;
export type NFTSeriesId = number;
export type NFTSerialNumber = number;
export type NFTListingId = number;
export type NFTId = [NFTCollectionId, NFTSeriesId, NFTSerialNumber];

export type NFTAttribute = {
	text?: string;
	url?: string;
	[key: string]: string;
};

export type NFTAttributes = Array<NFTAttribute>;

export type NFTMetadata = {
	name: string;
	description: string;
	image: string;
	properties: {
		quantity: number;
		creator: string;
		extension: string;
		owner?: string;
	};
};

export type NFTCollectionTuple = [NFTCollectionId, Array<NFTListingId>];
export type NFTListingTuple = [NFTCollectionId, NFTListingId];
export type NFTIndex = Array<[NFTListingId, NFTId]>;

export type NFTAttribute271 = { trait_type: string; value: string };
export type NFTMetadata271 = {
	name: string;
	description: string;
	image: string;
	encoding_format: string;
	attributes: Array<NFTAttribute271>;
	quantity: number;
	creator: string;
	[key: string]: any;
};

export interface MetaMaskAccount {
	address: string;
}

export type WalletOption = "CENNZnet" | "MetaMask";

declare module "*.svg";
