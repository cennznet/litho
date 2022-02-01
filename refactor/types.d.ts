import { ComponentPropsWithRef, PropsWithChildren, Context } from "react";
import { TokenId } from "@cennznet/types";

export type DOMComponentProps<T, E> = PropsWithChildren<T> &
	ComponentPropsWithRef<E>;

export type SortOrder = "ASC" | "DESC";

export type AssetInfo = {
	assetId: number;
	symbol: string;
	decimals: number;
};

export type NFTListing = {
	listingId: number;
	tokenId: NFTId;
	closeBlock?: number;
	type: "Auction" | "Fixed Price";
	price: number;
	paymentAssetId: number;
};

export type NFTData = {
	attributes: NFTAttributes;
	metadata: NFTMetadata;
	owner?: string;
};

export type NFTCollectionId = number;
export type NFTSeriesId = number;
export type NFTSerialNumber = number;
export type NFTListingId = number;
export type NFTId = [NFTCollectionId, NFTSeriesId, NFTSerialNumber];

export type NFTAttribute = {
	Text: string;
	URL: string;
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
