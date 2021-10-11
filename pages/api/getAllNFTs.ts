import { Api as ApiPromise } from "@cennznet/api";
import cache from '../../utils/cache';
import getMetadata from "../../utils/getMetadata";

const IPFSGatewayTools = require('@pinata/ipfs-gateway-tools/dist/node');
const gatewayTools = new IPFSGatewayTools();

const endpoint = process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT;
let api = null;

export default async (req, res) => {
  if(cache.has('nfts')) {
    res.statusCode = 200;
    const nftsFromCache = cache.get('nfts');
    res.json({ nfts: nftsFromCache, total: Object.keys(nftsFromCache).length, cacheHit: true });
    return;
  }
  // Create api instance only if it does not exist
  if (!api) {
    api = await ApiPromise.create({provider: endpoint});
  }

  const allListings = await api.query.nft.listings.entries();
  const nfts = [];
  await Promise.all(allListings.map(
    ([
      {
        args: [listingId],
      },
      listingData,
    ]) => {
      return new Promise(async (resolve) => {
        const listing: any = listingData.toJSON();
        let listingDetails = {};
        if(listing.hasOwnProperty('FixedPrice')) {
          const { close, fixedPrice, paymentAsset, seller, tokens, royaltiesSchedule } = listing.FixedPrice;
          listingDetails = {
            close,
            fixedPrice,
            paymentAsset,
            seller,
            tokens,
            royaltiesSchedule,
          }
        } else if(listing.hasOwnProperty('Auction')) {
          const { close, paymentAsset, reservePrice, seller, tokens, royaltiesSchedule } = listing.Auction;
          listingDetails = {
            close, paymentAsset, reservePrice, seller,
            tokens,
            royaltiesSchedule,
          }
        }

        const { tokens, ...restDetails } = listingDetails as any;
        await Promise.all((listingDetails as any).tokens.map(async (tokenId) => {
          const tokenInfo = await api.derive.nft.tokenInfo(tokenId);
          let metadata;
          let attributes = tokenInfo.attributes;
          let nft = { ...restDetails, ...tokenInfo, tokenId, ...attributes, listingId: listingId.toString(), metadata: metadata};
          if(tokenInfo.attributes) {
            metadata = getMetadata(tokenInfo.attributes);
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
        }));
        resolve({});
      });

    }
  ));

  cache.set('nfts', nfts);
  res.statusCode = 200;
  res.json({ nfts, total: allListings.length, cacheHit: false });
};
