import { Api as ApiPromise } from "@cennznet/api";
import { AuctionListing, FixedPriceListing, Listing } from "@cennznet/types";
import cache from '../../utils/cache';
import getMetadata from "../../utils/getMetadata";

const FEATURED_COUNT = 5;
const FEATURED_COLLECTION_ID = process.env.NEXT_FEATURED_COLLECTION_ID;
const endpoint = process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT;
let api = null;

export default async (req, res) => {
    if (cache.has('featuredListings')) {
        res.statusCode = 200;
        const cachedListings = cache.get('featuredListings');
        res.json({ featuredListings: cachedListings, total: Object.keys(cachedListings).length, cacheHit: true });
        return;
    }
    // Create api instance only if it does not exist
    if (!api) {
        api = await ApiPromise.create({ provider: endpoint });
    }

    const results = await api.query.nft.openCollectionListings.entries(FEATURED_COLLECTION_ID);
    const featureListings = results.slice(0, Math.min(FEATURED_COUNT, results.length));
    const featuredListings = [];

    await Promise.all(
        featureListings.map(([key, _active]) => {
            return new Promise(async (resolve) => {
                let [collectionId, listingId] = key.args.map((k) => k.toHuman());
                let listingRaw: Listing = (
                    await api.query.nft.listings(listingId)
                ).unwrap();
                let listing: FixedPriceListing | AuctionListing = listingRaw.isFixedPrice
                    ? listingRaw.asFixedPrice
                    : listingRaw.asAuction;
                let [collectionId_, seriesId, serialNumber] = listing.tokens[0];
                let attributes = (await api.query.nft.seriesAttributes(
                    collectionId,
                    seriesId
                )).toJSON();
                let metadata = getMetadata(attributes);
                if (metadata) {
                    const metadataAttributes = metadata.split(" ");
                    const metaAsObject = metadataAttributes.length > 1;
                    metadata = metaAsObject
                        ? metadataAttributes[1]
                        : metadataAttributes[0];
                }
                featuredListings.push({
                    tokenId: listing.tokens[0],
                    listingId,
                    attributes,
                    metadata,
                });

                resolve({});
            })
        }));
    cache.set('featuredListings', featuredListings);
    res.statusCode = 200;
    res.json({ featuredListings, total: featuredListings.length, cacheHit: false });
};
