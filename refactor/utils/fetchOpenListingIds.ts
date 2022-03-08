import { Api } from "@cennznet/api";
import { SortOrder } from "@refactor/types";
import isFinite from "lodash/isFinite";

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
		.map((key) => {
			const args = key.args.map((arg) => arg.toString());
			return Number(args[1]);
		})
		.filter(isFinite)
		.sort((a, b) => (sortOrder === "ASC" ? a - b : b - a));
}
