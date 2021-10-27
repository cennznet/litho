import { Api as ApiPromise } from "@cennznet/api";
import cache from '../../utils/cache';
import getMetadata from "../../utils/getMetadata";
import {Listing, TokenId} from "@cennznet/types";

const endpoint = 'wss://cennznet.unfrastructure.io/public/ws';

export default async (req, res) => {
  if(cache.has('nft_Collections')) {
    res.statusCode = 200;
    const collectionFromCache = cache.get('nft_Collections');
    res.json({ nfts: collectionFromCache, total: Object.keys(collectionFromCache).length, cacheHit: true });
    return;
  }
  let api;
  // Create api instance only if it does not exist
  if (!api) {
    api = await ApiPromise.create({provider: endpoint});
  }

  const nextCollection = await api.query.nft.nextCollectionId();
  const collections = nextCollection.toNumber() - 2;
  const collectionIds  = Array.from(Array(collections).keys());
  const nfts = [];
  await Promise.all(
      collectionIds.map(async (collectionId) => {
        const openListingKeys = await api.query.nft.openCollectionListings.keys(collectionId);
        // check if listing exist
            if (openListingKeys.length !== 0) {
              const listingIDs = openListingKeys.map((storageKey) => {
                return storageKey.args.map((k) => k.toHuman())[1];
              });
              // Get info for first listing
              const firstListingInfo = await api.query.nft.listings(listingIDs[0]);
              const collectionOwner = await api.query.nft.collectionOwner(collectionId);
              const listing: Listing = firstListingInfo.unwrapOrDefault();
              const tokenId: TokenId = listing.isAuction
                  ? listing.asAuction.toJSON().tokens[0]
                  : listing.asFixedPrice.toJSON().tokens[0];
              const tokenInfo = await api.derive.nft.tokenInfo(tokenId);
                  let attributes = tokenInfo.attributes;
                  let nft = { ...tokenInfo, tokenId, ...attributes, owner: collectionOwner, showOne: true};
                  if(attributes) {
                    let metadata = getMetadata(tokenInfo.attributes);
                      if (metadata) {
                        const metadataAttributes = metadata.split(" ");
                        const metaAsObject = metadataAttributes.length > 1;
                        metadata = metaAsObject
                            ? metadataAttributes[1]
                            : metadataAttributes[0];

                      }
                      nft = {...nft, metadata }
                  }
              nfts.push(nft);
            }
      })
  );

  cache.set('nft_Collections', nfts);
  res.statusCode = 200;
  res.json({ nftsCollection: nfts, total: nfts.length, cacheHit: false });
};
