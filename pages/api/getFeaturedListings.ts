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
    const featuredListings = results
        .slice(0, Math.min(FEATURED_COUNT, results.length))
        .map(([key, _active]) => key.args.map((k) => k.toHuman()));

    cache.set('featuredListings', featuredListings);
    res.statusCode = 200;
    res.json({ featuredListings, total: featuredListings.length, cacheHit: false });
};
