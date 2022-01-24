import { ComponentPropsWithRef, PropsWithChildren, Context } from "react";
import { TokenId } from "@cennznet/types";

export type DOMComponentProps<T, E> = PropsWithChildren<T> &
	ComponentPropsWithRef<E>;

export type NFTListing = {
	listingId: string;
	token: NFT;
};

export type NFT = {
	tokenId: NFTIdTuple;
	attributes: NFTAttributes;
	metadata: NFTMetadata;
};

export type NFTCollectionId = number;
export type NFTSeriesId = number;
export type NFTSerialNumber = number;
export type NFTIdTuple = [NFTCollectionId, NFTSeriesId, NFTSerialNumber];

export type NFTAttributes = Array<{
	Text: string;
}>;

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
