import { Api as ApiPromise } from "@cennznet/api";
import { TypeRegistry } from "@polkadot/types";
import cache from '../../utils/cache';

const registry = new TypeRegistry();
const endpoint = process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT;

const getAttributes = async (attributes) => {
  let attributesObj: {[index: string]: string | Array<any>} = {};
  let otherAttributes = [];
  attributes.forEach(({ Text, Url }) => {
    const attributeString = Text || Url;
    if (attributeString) {
      const attributeBreakup = attributeString.split(" ");
      switch (attributeBreakup[0]) {
        case "Image-URL":
          attributesObj.image = attributeBreakup[1];
          break;
        case "Metadata-URL":
          attributesObj.metadata = attributeBreakup[1];
          break;
        case "Title":
          const [_, ...words] = attributeBreakup;
          attributesObj.title = words.join(" ");
        case "Description":
          const [, ...description] = attributeBreakup;
          attributesObj.description = description.join(" ");
          break;
        case "File-Type":
          const [, ...fileType] = attributeBreakup;
          attributesObj.fileType = fileType;
          break;
        case "Quantity":
          break;
        case "Video-URL":
          const [, video] = attributeBreakup;
          attributesObj.videoUrl = video;
          break;
        default:
          if(attributes.length === 1) {
            attributesObj.metadata = attributeBreakup[0];
          } else {
            otherAttributes.push(attributeString);
          }
          break;
      }
    }
  });
  if(otherAttributes.length > 0) {
    attributesObj.attributes = otherAttributes;
  }

  // if(!attributesObj.image && attributesObj.metadata) {
  //   try {

  //     await fetch(attributesObj.metadata as string).then((res) => res.json()).then((metadata) => {
  //       if(metadata.image) {
  //         attributesObj.image = metadata.image;
  //         attributesObj.name = metadata.name;
  //         attributesObj.description = metadata.description;
  //       }
  //     });
  //   } catch(error) {
  //     console.log(`Failed to load json at ${attributesObj.metadata}`);
  //   }
  // }

  return attributesObj;
}

export default async (req, res) => {
  if(cache.has('nfts')) {
    res.statusCode = 200;
    const nftsFromCache = cache.get('nfts');
    res.json({ nfts: nftsFromCache, total: Object.keys(nftsFromCache).length, cacheHit: true });
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
          let attributes = {};
          if(tokenInfo.attributes) {
            attributes = await getAttributes(tokenInfo.attributes);
          }
          nfts.push({ ...restDetails, ...tokenInfo, tokenId, ...attributes, listingId: listingId.toString()});
        }));
        resolve({});
      });

    }
  ));

  cache.set('nfts', nfts);
  res.statusCode = 200;
  res.json({ nfts, total: allListings.length, cacheHit: false });
};
