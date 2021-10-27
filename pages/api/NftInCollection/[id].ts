import { Api as ApiPromise } from "@cennznet/api";
import cache from '../../../utils/cache';
import getMetadata from "../../../utils/getMetadata";
import {Listing, TokenId} from "@cennznet/types";

const endpoint = 'wss://cennznet.unfrastructure.io/public/ws';
// let api = null;

export default async (req, res) => {

  let api;
  // Create api instance only if it does not exist
  if (!api) {
    api = await ApiPromise.create({provider: endpoint});
  }
  const collectionId = req.query.id;
  if(cache.has(`nftsInCollection_${collectionId}`)) {
    res.statusCode = 200;
    const collectionFromCache = cache.get(`nftsInCollection_${collectionId}`);
    res.json({ nftsInCollection: collectionFromCache, total: Object.keys(collectionFromCache).length, cacheHit: true });
    return;
  }

  const nfts = [];
        const openListingKeys = await api.query.nft.openCollectionListings.keys(collectionId);
        // check if listing exist
            if (openListingKeys.length !== 0) {
              const listingIDs = openListingKeys.map((storageKey) => {
                return storageKey.args.map((k) => k.toHuman())[1];
              });
              await Promise.all(
                  listingIDs.map(async (listingId) => {
                    const listingInfo = await api.query.nft.listings(listingId);
                    const listing: Listing = listingInfo.unwrapOrDefault();
                    const tokenId: TokenId = listing.isAuction
                        ? listing.asAuction.toJSON().tokens[0]
                        : listing.asFixedPrice.toJSON().tokens[0];
                    const tokenInfo = await api.derive.nft.tokenInfo(tokenId);
                    let attributes = tokenInfo.attributes;
                    let nft = {...tokenInfo, tokenId, ...attributes, showOne: true};
                    if (attributes) {
                      let metadata = getMetadata(tokenInfo.attributes);
                      if (metadata) {
                        const metadataAttributes = metadata.split(" ");
                        const metaAsObject = metadataAttributes.length > 1;
                        metadata = metaAsObject
                            ? metadataAttributes[1]
                            : metadataAttributes[0];

                      }
                      nft = {...nft, metadata}
                    }
                    nfts.push(nft);
                  }));
            }

  cache.set(`nftsInCollection_${collectionId}`, nfts);
  res.statusCode = 200;
  res.json({ nftsInCollection: nfts, total: nfts.length, cacheHit: false });
};
