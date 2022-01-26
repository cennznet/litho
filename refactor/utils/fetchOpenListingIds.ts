import { Api } from "@cennznet/api";
import { SortOrder } from "@refactor/types";

/**
 * Fetches open listing identifiers.
 *
 * @param {Api} api
 * @param {(number)} collectionId
 * @param {("ASC"|"DESC"|string)} sortOrder
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
		.sort((a, b) => (sortOrder === "ASC" ? a - b : b - a));
}
