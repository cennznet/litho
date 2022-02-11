import { Api } from "@cennznet/api";
import { NFTCollectionId } from "@refactor/types";
import createCacheStore from "@refactor/utils/createCacheStore";

export default async function findCollectionIdByAddress(
	api: Api,
	accountAddress: string
): Promise<NFTCollectionId> {
	const entries = await fetchAllCollectionOwnerEntries(api);
	return entries.find(({ address }) => address === accountAddress)
		?.collectionId;
}

export async function fetchAllCollectionOwnerEntries(
	api: Api
): Promise<Array<{ collectionId: NFTCollectionId; address: string }>> {
	return createCacheStore().wrap("fetchAllCollectionOwnerEntries", async () => {
		return [...(await api.query.nft.collectionOwner.entries())].map(
			([key, value]) => ({
				collectionId: parseInt(key.toHuman()?.[0], 10),
				address: value.toString(),
			})
		);
	});
}
