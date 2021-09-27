import React, { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import Web3Context from "../../../../components/Web3Context";
import Text from "../../../../components/Text";
import getFileExtension from "../../../../utils/getFileExtension";
import isImageOrVideo from "../../../../utils/isImageOrVideo";
import getMetadata from "../../../../utils/getMetadata";
import NFT from "../../../../components/nft";
import SupportedAssetsContext from "../../../../components/SupportedAssetsContext";
import TxStatusModal from "../../../../components/sell/TxStatusModal";
import { GetRemainingTime } from "../../../../utils/chainHelper";
import Input from "../../../../components/Input";
import { Time } from "@polkadot/util/types";
import { SupportedAssetInfo } from "../../../../components/SupportedAssetsProvider";

interface RendererProps {
  nft: any;
  error: any;
  isOwner: boolean;
  onBuyNow: any;
  onConfirmBid: any;
  onPlaceBid: any;
  endTime: Time;
  listingInfo: any;
  paymentAsset: SupportedAssetInfo;
  reservePrice: number;
  fixedPrice: number;
}

const buyWithFixedPrice = async (api, account, listingId) => {
  const buyExtrinsic = await api.tx.nft.buy(listingId);

  return new Promise((resolve, reject) => {
    buyExtrinsic
      .signAndSend(account.signer, account.payload, ({ status }) => {
        if (status.isInBlock) {
          resolve(status.asInBlock.toString());
          console.log(
            `Completed at block hash #${status.asInBlock.toString()}`
          );
        }
      })
      .catch((error) => {
        console.log(":( transaction failed", error);
        reject(error);
      });
  });
};

const placeABid = async (api, account, listingId, amount) => {
  const extrinsic = await api.tx.nft.bid(listingId, amount);

  return new Promise((resolve, reject) => {
    extrinsic
      .signAndSend(account.signer, account.payload, ({ status }) => {
        if (status.isInBlock) {
          resolve(status.asInBlock.toString());
          console.log(
            `Completed at block hash #${status.asInBlock.toString()}`
          );
        }
      })
      .catch((error) => {
        console.log(":( transaction failed", error);
        reject(error);
      });
  });
};

const NFTDetailRenderer: React.FC<RendererProps> = ({
  nft,
  error,
  endTime,
  isOwner,
  reservePrice,
  fixedPrice,
  paymentAsset,
  listingInfo,
  onBuyNow,
  onConfirmBid,
  onPlaceBid,
}) => {
  const web3Context = React.useContext(Web3Context);
  const image = nft.image;
  const [imageUrl, setImageUrl] = React.useState(null);
  const [fileExtension, setFileExtension] = React.useState(
    !error && nft.coverFileExtension
      ? nft.coverFileExtension
      : !error && nft.extension
      ? nft.extension
      : null
  );
  const [isPlaceABid, setIsPlaceABid] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!error && !fileExtension) {
      (async () => {
        const res = await fetch(image);
        const contentType = res.headers.get("content-type");
        const extension = getFileExtension(contentType);
        setFileExtension(extension);
      })();
    }
  }, []);

  React.useEffect(() => {
    if (fileExtension) {
      let url;

      if (!image || !fileExtension || !isImageOrVideo(fileExtension) || error) {
        url = "/litho-default.jpg";
      } else if (typeof image === "object") {
        url = URL.createObjectURL(image);
      } else {
        url = image;
      }
      setImageUrl(url);
    }
  }, [fileExtension]);

  if (!imageUrl && !error) {
    return null;
  }

  const displayOwner = nft.owner
    ? `${nft.owner.substr(0, 8)}...${nft.owner.substr(-8)}`
    : "";

  return imageUrl ? (
    <div className="border border-litho-black mt-7 mb-6 flex flex-col h-full">
      <div className="border-b border-litho-black px-10 py-5 flex items-center">
        <Text variant="h3" component="h3" className="flex-1">
          {nft.name}
        </Text>
        {(nft.extension || nft.coverFileExtension) && (
          <Text variant="h6" className="mr-8">
            File Type:{" "}
            <span className="text-litho-black text-opacity-50">
              {nft.extension || nft.coverFileExtension}
            </span>
          </Text>
        )}
        <Text variant="h6">
          Copies:{" "}
          <span className="text-litho-black text-opacity-50">{nft.copies}</span>
        </Text>
      </div>
      <div className="flex">
        <div className="w-2/3 border-r border-litho-black">
          <div
            className="border-b border-litho-black flex items-center justify-center"
            style={{ minHeight: "500px", maxHeight: "499px" }}
          >
            {isImageOrVideo(fileExtension) === "video" ? (
              <video
                src={nft.image}
                height="300"
                controls
                autoPlay
                width="300"
                loop
                controlsList="nodownload"
                className="object-contain object-center w-full bg-litho-black bg-no-repeat bg-center"
              />
            ) : (
              <img
                src={nft.image}
                className="object-contain object-center bg-image-loading bg-no-repeat bg-center"
                onLoad={(event) => {
                  if (event.target) {
                    (event.target as HTMLImageElement).classList.remove(
                      "bg-image-loading"
                    );
                  }
                }}
                onError={(event) => {
                  (event.target as HTMLImageElement).src = "/litho-default.jpg";
                  (event.target as HTMLImageElement).style.height = "499px";
                }}
                style={{ maxHeight: "499px" }}
              />
            )}
          </div>
          <div className="p-5 flex items-center justify-around">
            <Link href={nft.image}>
              <a
                className="text-litho-blue font-medium text-lg underline"
                target="_blank"
              >
                View on IPFS
              </a>
            </Link>
            <Link href={nft.metadata}>
              <a
                className="text-litho-blue font-medium text-lg underline"
                target="_blank"
              >
                IPFS Metadata
              </a>
            </Link>
            {nft.file && (
              <Link href={nft.file}>
                <a
                  className="text-litho-blue font-medium text-lg underline"
                  target="_blank"
                >
                  Download File
                </a>
              </Link>
            )}
          </div>
        </div>
        <div className="w-1/3">
          {!isPlaceABid ? (
            <>
              {listingInfo &&
                listingInfo.listingId &&
                (listingInfo.auctionInfo || listingInfo.fixedPriceInfo) && (
                  <div className="w-full p-8 flex flex-col border-b border-litho-black">
                    {listingInfo.fixedPriceInfo && (
                      <>
                        <div className="flex justify-between">
                          <Text variant="h6" className="text-opacity-50">
                            Fixed Price
                          </Text>
                          <Text variant="h6">
                            {endTime &&
                              `Ending in ${endTime.days} days ${endTime.hours} hours`}
                          </Text>
                        </div>
                        <div className="flex justify-between">
                          <Text variant="h3" className="mt-6">
                            {fixedPrice} {paymentAsset?.symbol}
                          </Text>
                        </div>
                      </>
                    )}
                    {listingInfo.auctionInfo && (
                      <>
                        <div className="flex justify-between">
                          <Text variant="h6" className="text-opacity-50">
                            Live Auction
                          </Text>
                          <Text variant="h6">
                            {endTime &&
                              `Ending in ${endTime.days} days ${endTime.hours} hours`}
                          </Text>
                        </div>
                        <Text variant="h3" className="mt-6">
                          {reservePrice} {paymentAsset?.symbol}
                        </Text>
                      </>
                    )}
                    {listingInfo.auctionInfo && (
                      <div className="w-full flex-col md:flex-row flex items-center justify-between mt-4">
                        <button
                          className="md:w-auto border bg-litho-blue flex-1 mt-4 md:mt-0 text-center py-2"
                          onClick={() => setIsPlaceABid(true)}
                        >
                          <Text variant="button" color="white">
                            PLACE A BID
                          </Text>
                        </button>
                      </div>
                    )}
                    {listingInfo.fixedPriceInfo && (
                      <div className="w-full flex-col md:flex-row flex items-center justify-between mt-10">
                        <button
                          className="md:w-auto border bg-litho-blue flex-1 mt-4 md:mt-0 text-center py-2"
                          onClick={onBuyNow}
                        >
                          <Text variant="button" color="white">
                            BUY NOW
                          </Text>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              <div className="w-full p-8 flex flex-col border-b border-litho-black">
                <Text variant="h6">Creator</Text>
                <Text variant="h6" className="text-opacity-50">
                  {displayOwner}{" "}
                  {web3Context.account
                    ? web3Context.account.address === nft.owner
                      ? "(You)"
                      : null
                    : null}
                </Text>
                {isOwner !== undefined && (
                  <Link
                    href={`/sell?collectionId=${nft.collectionId}&seriesId=${nft.seriesId}&serialNumber=${nft.serialNumber}`}
                  >
                    <a className="w-full md:w-auto border bg-litho-blue flex-1 mt-4 md:mt-0 md:ml-6 text-center py-2">
                      <Text variant="button" color="white">
                        SELL
                      </Text>
                    </a>
                  </Link>
                )}
              </div>
              {nft.description && (
                <div className="w-full p-8 flex flex-col border-b border-litho-black">
                  <Text variant="h6">Description</Text>
                  <Text variant="body2" className="text-opacity-50 break-all">
                    {nft.description}
                  </Text>
                </div>
              )}
              {nft.attributes.length > 0 && (
                <div className="w-full p-8 flex flex-col border-b border-litho-black">
                  <Text variant="h6">Attributes</Text>
                  {nft.attributes.map((attribute) => {
                    if (!attribute) {
                      return null;
                    }
                    let attributeText;
                    if (
                      attribute.hasOwnProperty("Url") &&
                      !attribute.Url.startsWith("Metadata")
                    ) {
                      attributeText = attribute.Url;
                    } else if (attribute.hasOwnProperty("Text")) {
                      attributeText = attribute.Text;
                    }
                    return (
                      <Text
                        variant="body1"
                        className="text-opacity-50 break-all my-2"
                        key={attributeText}
                      >
                        {attributeText}
                      </Text>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="w-full p-8 flex flex-col border-b border-litho-black">
              <div className="flex justify-between">
                <Text variant="h6" className="text-opacity-50">
                  Live Auction
                </Text>
                <Text variant="h6">
                  {endTime &&
                    `Ending in ${endTime.days} days ${endTime.hours} hours`}
                </Text>
              </div>
              <form onSubmit={onConfirmBid}>
                <div className="w-full flex flex-col m-auto mt-10">
                  <Text variant="h3" className="mb-6">
                    Enter a bid
                  </Text>
                  <Input
                    name="price"
                    type="text"
                    placeholder={`Minimum bid of ${reservePrice} ${paymentAsset?.symbol}`}
                  />
                  <Text
                    variant="caption"
                    className="w-full text-opacity-60 mt-10 mb-10"
                  >
                    Once a bid is placed it cant be withdrawn, additional Ts
                    andCs here Lorem ipsum dolor sit amet, consectetur
                    adipiscing elit, sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua.
                  </Text>
                </div>
                <div className="w-full flex-col md:flex-row flex items-center justify-between mt-10">
                  <button
                    className="w-full md:w-auto border border-litho-blue bg-litho-cream flex-1 mt-4 md:mt-0 text-center py-2"
                    onClick={() => setIsPlaceABid(false)}
                  >
                    <Text variant="button" color="litho-blue">
                      CANCEL
                    </Text>
                  </button>
                  <button className="w-full md:w-auto border bg-litho-blue flex-1 mt-4 md:mt-0 md:ml-6 text-center py-2">
                    <Text variant="button" color="white">
                      CONFIRM BID
                    </Text>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : error ? (
    <div className="border border-litho-black h-customScreen flex items-center justify-center text-4xl text-litho-black text-opacity-50">
      Could not load NFT
    </div>
  ) : null;
};

const NFTDetail: React.FC<{}> = () => {
  const router = useRouter();
  const web3Context = React.useContext(Web3Context);
  const [nft, setNFT] = React.useState<{ [index: string]: any }>();
  const supportedAssetContext = React.useContext(SupportedAssetsContext);
  const supportedAssets = useMemo(() => {
    return supportedAssetContext.supportedAssets;
  }, [supportedAssetContext]);

  const [currentBlock, setCurrentBlock] = React.useState<number>();
  const [isOwner, setIsOwner] = React.useState(false);
  const [listingInfo, setListingInfo] = React.useState<any>();
  const [modalState, setModalState] = React.useState<string>();

  React.useEffect(() => {
    if (!web3Context.api) {
      return;
    }
    (async () => {
      web3Context.api.isReady.then(async () => {
        const tokenInfo = await web3Context.api.derive.nft.tokenInfo({
          collectionId: router.query.collectionId,
          seriesId: router.query.seriesId,
          serialNumber: router.query.serialNumber,
        });

        const tokenOwner = await web3Context.api.query.nft.tokenOwner(
          (router.query.collectionId, router.query.seriesId),
          router.query.serialNumber
        );

        const currentBlock = (
          await web3Context.api.rpc.chain.getBlock()
        ).block.header.number.toNumber();
        setCurrentBlock(Number(currentBlock));

        const seriesIssuance = await web3Context.api.query.nft.seriesIssuance(
          router.query.collectionId,
          router.query.seriesId
        );

        const { attributes, owner } = tokenInfo;
        const metadata = getMetadata(attributes);

        const nft: { [index: string]: any } = {
          owner: tokenOwner,
          collectionId: router.query.collectionId,
          seriesId: router.query.seriesId,
          serialNumber: router.query.serialNumber,
          attributes: attributes,
          copies: seriesIssuance.toJSON(),
          metadata,
        };

        setNFT(nft);
      });
    })();
  }, [
    web3Context.api,
    router.query.collectionId,
    router.query.seriesId,
    router.query.serialNumber,
  ]);

  useEffect(() => {
    if (!web3Context.api || !web3Context.account) {
      return;
    }
    (async () => {
      const isApiReady = await web3Context.api.isReady;
      if (isApiReady) {
        let openListing = undefined;
        try {
          openListing = await web3Context.api.derive.nft.openCollectionListings(
            router.query.collectionId
          );
        } catch (e) {
          openListing = [];
        }

        const listingInfo = openListing.find((listing) => {
          return (
            listing.tokenId.collectionId.toNumber() ===
              Number(router.query.collectionId) &&
            listing.tokenId.seriesId.toNumber() ===
              Number(router.query.seriesId) &&
            listing.tokenId.serialNumber.toNumber() ===
              Number(router.query.serialNumber)
          );
        });
        let auctionInfo = undefined;
        let fixedPriceInfo = undefined;

        if (listingInfo) {
          const listing = (
            await web3Context.api.query.nft.listings(listingInfo.listingId)
          ).unwrapOrDefault();
          if (listing.isAuction) {
            auctionInfo = listing.asAuction.toJSON();
          } else {
            fixedPriceInfo = listing.asFixedPrice.toJSON();
          }
        }

        setListingInfo({
          listingId: listingInfo?.listingId.toNumber(),
          auctionInfo: auctionInfo,
          fixedPriceInfo: fixedPriceInfo,
        });

        const copies = await web3Context.api.query.nft.seriesIssuance(
          router.query.collectionId,
          router.query.seriesId
        );

        let copyParams = [];
        if (router.query.serialNumber === "0") {
          for (let i = 0; i < copies.toNumber(); i++) {
            copyParams.push([
              [router.query.collectionId, router.query.seriesId],
              i,
            ]);
          }
        } else {
          copyParams.push([
            [router.query.collectionId, router.query.seriesId],
            router.query.serialNumber,
          ]);
        }
        const copyOwners = await web3Context.api.query.nft.tokenOwner.multi(
          copyParams
        );
        for (let i = 0; i < copyOwners.length; i++) {
          const isOwner =
            copyOwners[i].toString() === web3Context.account.address.toString();
          const isOnSale = openListing.find((listing) => {
            return (
              listing.tokenId.collectionId.toNumber() ===
                Number(router.query.collectionId) &&
              listing.tokenId.seriesId.toNumber() ===
                Number(router.query.seriesId) &&
              listing.tokenId.serialNumber.toNumber() === i
            );
          });
          if (isOwner && !isOnSale) {
            setIsOwner(true);
            break;
          }
        }
      }
    })();
  }, [web3Context.api, web3Context.account]);

  const paymentAsset = useMemo(() => {
    let paymentAssetId = undefined;
    if (listingInfo && listingInfo.fixedPriceInfo) {
      paymentAssetId = listingInfo.fixedPriceInfo.paymentAsset;
    }
    if (listingInfo && listingInfo.auctionInfo) {
      paymentAssetId = listingInfo.auctionInfo.paymentAsset;
    }
    if (supportedAssets && supportedAssets.length > 0 && paymentAssetId) {
      return supportedAssets.find((asset) => asset.id === paymentAssetId);
    }
  }, [listingInfo, supportedAssets]);

  const reservePrice = useMemo(() => {
    if (listingInfo && listingInfo.auctionInfo && paymentAsset) {
      const price = listingInfo.auctionInfo.reservePrice;
      return price / 10 ** paymentAsset.decimals;
    }
    return 0;
  }, [listingInfo, paymentAsset]);

  const fixedPrice = useMemo(() => {
    if (listingInfo && listingInfo.fixedPriceInfo && paymentAsset) {
      const price = listingInfo.fixedPriceInfo.fixedPrice;
      return price / 10 ** paymentAsset.decimals;
    }
    return 0;
  }, [listingInfo, paymentAsset]);

  const endTime = useMemo(() => {
    if (listingInfo && web3Context.api) {
      let blocks = 0;
      if (listingInfo.fixedPriceInfo) {
        blocks = Number(listingInfo.fixedPriceInfo.close) - currentBlock;
        return GetRemainingTime(web3Context.api, blocks);
      }
      if (listingInfo.auctionInfo) {
        blocks = Number(listingInfo.auctionInfo.close) - currentBlock;
        return GetRemainingTime(web3Context.api, blocks);
      }
    }
  }, [listingInfo, web3Context.api, currentBlock]);

  const buyNow = useCallback(
    async (e) => {
      e.preventDefault();
      if (web3Context.api && listingInfo && listingInfo.listingId) {
        try {
          setModalState("txInProgress");
          await buyWithFixedPrice(
            web3Context.api,
            web3Context.account,
            listingInfo.listingId
          );
          setModalState("success");
        } catch (e) {
          setModalState("error");
        }
      }
    },
    [listingInfo, web3Context.api, web3Context.account]
  );

  const confirmBid = useCallback(
    async (e) => {
      e.preventDefault();
      const { price } = e.currentTarget;

      if (
        !price.value ||
        !paymentAsset ||
        !listingInfo ||
        !listingInfo.auctionInfo ||
        !listingInfo.listingId
      ) {
        return;
      }

      if (+price.value < +reservePrice) {
        return;
      }

      const priceInUnit = +price.value * 10 ** paymentAsset.decimals;

      if (web3Context.api) {
        try {
          setModalState("txInProgress");
          await placeABid(
            web3Context.api,
            web3Context.account,
            listingInfo.listingId,
            priceInUnit
          );
          setModalState("success");
        } catch (e) {
          console.log(":( transaction failed", e);
          setModalState("error");
        }
      }
    },
    [
      paymentAsset,
      listingInfo,
      web3Context.api,
      reservePrice,
      web3Context.account,
    ]
  );

  const props: RendererProps = {
    nft,
    error: undefined,
    isOwner,
    onBuyNow: buyNow,
    onConfirmBid: confirmBid,
    onPlaceBid: placeABid,
    endTime,
    listingInfo,
    paymentAsset,
    reservePrice,
    fixedPrice,
  };

  return (
    <>
      <button
        className="font-bold"
        style={{ lineHeight: "31px" }}
        onClick={() => router.back()}
      >
        &lt; Back
      </button>

      {nft && nft.length > 0 && (
        <NFT nft={nft} renderer={NFTDetailRenderer} {...props} />
      )}

      {modalState && (
        <TxStatusModal
          successLink={`/marketplace`}
          errorLink={"/marketplace"}
          modalState={modalState}
          setModalState={setModalState}
        />
      )}
    </>
  );
};

export default NFTDetail;
