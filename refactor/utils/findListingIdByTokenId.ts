import { Api } from "@cennznet/api";
import { NFTId, NFTListingId, NFTIndex } from "@refactor/types";
import createCacheStore from "@refactor/utils/createCacheStore";
import { fetchAllOpenListingIds } from "@refactor/utils/fetchLatestOpenListingIds";
import fetchListingItem from "@refactor/utils/fetchListingItem";
import isFinite from "lodash/isFinite";

/**
 * Finds `listingId` by `tokenId`
 *
 * @param {Api} api The api
 * @param {NFTId} tokenId The token identifier
 * @return {Promise<NFTListingId>} { description_of_the_return_value }
 */
export default async function findListingIdByTokenId(
	api: Api,
	tokenId: NFTId
): Promise<NFTListingId> {
	const locks = (
		(await api.query.nft.tokenLocks(tokenId)) as any
	).unwrapOrDefault();

	let listingId = locks?.toJSON?.()?.ListingId;

	if (!isFinite(listingId))
		listingId = await findIndexedListingIdByTokenId(api, tokenId);

	return listingId;
}

export async function indexAllOpenListingItems(api: Api): Promise<NFTIndex> {
	return createCacheStore().wrap("indexAllOpenListingItems", async () => {
		const allOpenListingIds = await fetchAllOpenListingIds(api);

		return (
			await Promise.all(
				allOpenListingIds.map(
					async ([, listingIds]) =>
						await Promise.all(
							listingIds.map(async (listingId) => [
								listingId,
								await fetchListingItem(api, listingId).then(
									({ tokenId }) => tokenId
								),
							])
						)
				)
			)
		).flat();
	});
}

export async function findIndexedListingIdByTokenId(
	api: Api,
	tokenId: NFTId
): Promise<NFTListingId> {
	const allOpenListingItems = await indexAllOpenListingItems(api);
	const joinedTokenId = tokenId.join("");

	const [listingId] =
		allOpenListingItems.find(
			([, tokenId]) => tokenId.join("") === joinedTokenId
		) || [];

	return listingId;
}
