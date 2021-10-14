import { Api as ApiPromise } from "@cennznet/api";
import { AuctionListing, FixedPriceListing, Listing } from "@cennznet/types";
import cache from '../../utils/cache';
import getMetadata from "../../utils/getMetadata";

const FEATURED_COUNT = 15;
const NEXT_FEATURED_LISTING_ID = process.env.NEXT_FEATURED_LISTING_ID;
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

    const featuredListings = [];
    const featureListingIds = NEXT_FEATURED_LISTING_ID.split(',');
    await Promise.all(
        featureListingIds.map((listingId) => {
            return new Promise(async (resolve) => {
                let listingRaw: Listing = (
                    await api.query.nft.listings(listingId)
                ).unwrap();
                if (listingRaw) {
                    let listing: FixedPriceListing | AuctionListing = listingRaw.isFixedPrice
                        ? listingRaw.asFixedPrice
                        : listingRaw.asAuction;
                    let [collectionId, seriesId] = listing.tokens[0];
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
                }
                resolve({});
            })
        }));
    cache.set('featuredListings', featuredListings);
    res.statusCode = 200;
    res.json({ featuredListings, total: featuredListings.length, cacheHit: false });
};
