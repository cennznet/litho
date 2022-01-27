import { Api } from "@cennznet/api";
import { NFTIndex, NFTId, NFTListingId } from "@refactor/types";
import createCacheStore from "@refactor/utils/createCacheStore";
import { fetchAllOpenListingIds } from "@refactor/utils/fetchLatestOpenListingIds";
import fetchListingItem from "@refactor/utils/fetchListingItem";

export default async function indexAllOpenListingItems(
	api: Api
): Promise<NFTIndex> {
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

export async function findListingIdByTokenId(
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
