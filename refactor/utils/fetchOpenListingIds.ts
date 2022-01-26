import { Api } from "@cennznet/api";
import { CollectionTupple, SortOrder } from "@refactor/types";

/**
 * Fetches all open listing ids from a collection
 *
 * @param {Api} api
 * @param {(number)} collectionId
 * @param {("ASC"|"DESC")} sortOrder
 * @return {Promise<Array<number>>}
 */
export default async function fetchOpenListingIds(
	api: Api,
	collectionId: number,
	sortOrder: SortOrder = "DESC"
): Promise<Array<number>> {
	return Array.from(
		await api.query.nft.openCollectionListings.keys(collectionId)
	)
		.map((key) => parseInt(key.toHuman()[1], 10))
		.filter(Boolean)
		.sort((a, b) => (sortOrder === "ASC" ? a - b : b - a));
}

/**
 * Fetches all open listings across the whole marketplace
 *
 * @param {Api} api
 * @param {SortOrder} sortOrder
 * @return {Promise<Array<CollectionTupple>>} All open listing identifiers.
 */
export async function fetchAllOpenListingIds(
	api: Api,
	sortOrder: SortOrder = "DESC"
): Promise<Array<CollectionTupple>> {
	const nextCollectionId = (await api.query.nft.nextCollectionId()).toJSON();
	const allPossibleCollectionIds = Array.from(
		new Array(nextCollectionId).keys()
	);

	// extract most recent listing from each collection
	// as the representative of that collection
	return (
		await Promise.all(
			allPossibleCollectionIds.map(async (collectionId) => {
				const listingIds = await fetchOpenListingIds(api, collectionId);
				if (!listingIds?.length) return false;
				return [collectionId, listingIds[0]];
			})
		)
	)
		.filter(Boolean)
		.sort((a, b) =>
			sortOrder === "ASC" ? a[1] - b[1] : b[1] - a[1]
		) as Array<CollectionTupple>;
}
