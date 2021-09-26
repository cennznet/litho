import { Api as ApiPromise } from "@cennznet/api";
import { TypeRegistry } from "@polkadot/types";
import cache from '../../utils/cache';
import getMetadata from "../../utils/getMetadata";

const IPFSGatewayTools = require('@pinata/ipfs-gateway-tools/dist/node');
const gatewayTools = new IPFSGatewayTools();

const registry = new TypeRegistry();
const endpoint = process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT;

export default async (req, res) => {
  if(cache.has('nfts')) {
    res.statusCode = 200;
    const nftsFromCache = cache.get('nfts');
    res.json({ nfts: nftsFromCache, total: Object.keys(nftsFromCache).length, cacheHit: true });
    return;
  }
  const api = await ApiPromise.create({ provider: endpoint, registry });
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
          if(tokenInfo.attributes) {
            metadata = getMetadata(tokenInfo.attributes);
            if(metadata) {
              try {
                const metadataUrl = gatewayTools.convertToDesiredGateway(
                  metadata,
                  process.env.NEXT_PUBLIC_PINATA_GATEWAY
                );
                let metadataResponse;
                if(cache.has(metadataUrl)) {
                  metadataResponse = cache.get(metadataUrl);
                } else {
                  metadataResponse = await fetch(metadataUrl).then(res => res.json());
                  cache.set(metadataUrl, metadataResponse);
                }

                attributes = {
                  ...attributes,
                  ...metadataResponse,
                }
              } catch(error) {
                console.error(error.message);
              }
            }
          }

          nfts.push({ ...restDetails, ...tokenInfo, tokenId, ...attributes, listingId: listingId.toString(), metadata});
        }));
        resolve({});
      });

    }
  ));

  cache.set('nfts', nfts);
  res.statusCode = 200;
  res.json({ nfts, total: allListings.length, cacheHit: false });
};
