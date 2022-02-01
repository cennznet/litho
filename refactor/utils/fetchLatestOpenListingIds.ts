import { Api } from "@cennznet/api";
import {
	NFTListingTuple,
	NFTCollectionTuple,
	SortOrder,
} from "@refactor/types";
import fetchOpenListingIds from "@refactor/utils/fetchOpenListingIds";
import createCacheStore from "@refactor/utils/createCacheStore";

/**
 * Fetches the most recent `listingId` from all available collections
 *
 * @param {Api} api
 * @param {SortOrder} sortOrder
 * @return {Promise<Array<NFTListingTuple>>} All open listing identifiers.
 */
export default async function fetchLatestOpenListingIds(
	api: Api,
	sortOrder: SortOrder = "DESC"
): Promise<Array<NFTListingTuple>> {
	const allOpenListingIds = await fetchAllOpenListingIds(api);

	// extract most recent listing from each collection
	// as the representative of that collection
	return (
		await Promise.all(
			allOpenListingIds.map(async ([collectionId, listingIds]) => {
				if (!listingIds?.length) return;
				return [collectionId, listingIds[0]];
			})
		)
	)
		.filter(Boolean)
		.sort((a, b) =>
			sortOrder === "ASC" ? a[1] - b[1] : b[1] - a[1]
		) as Array<NFTListingTuple>;
}

/**
 * Fetches all open `listingId` from all available collections
 *
 * @param {Api} api
 * @return {Promise<Array<NFTCollectionTuple>>} All open listing identifiers.
 */
export async function fetchAllOpenListingIds(
	api: Api
): Promise<Array<NFTCollectionTuple>> {
	const nextCollectionId = (
		await api.query.nft.nextCollectionId()
	).toJSON() as number;
	const allPossibleCollectionIds = Array.from(
		new Array(nextCollectionId).keys()
	);

	return createCacheStore().wrap(nextCollectionId as any, async () => {
		return (
			await Promise.all(
				allPossibleCollectionIds.map(async (collectionId) => {
					const listingIds = await fetchOpenListingIds(api, collectionId);
					if (!listingIds?.length) return;
					return [collectionId, listingIds.sort((a, b) => b - a)];
				})
			)
		).filter(Boolean) as Array<NFTCollectionTuple>;
	});
}
