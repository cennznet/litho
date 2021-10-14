import React, { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import Web3Context from "../../../../components/Web3Context";
import Text from "../../../../components/Text";
import SupportedAssetsContext from "../../../../components/SupportedAssetsContext";
import TxStatusModal from "../../../../components/sell/TxStatusModal";
import { GetRemainingTime } from "../../../../utils/chainHelper";
import Input from "../../../../components/Input";
import Loader from "../../../../components/Loader";
import getMetadata from "../../../../utils/getMetadata";
import NFTRenderer from "../../../../components/nft/NFTRenderer";
import NFT from "../../../../components/nft";
import axios from "axios";

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

const NFTDetail: React.FC<{}> = () => {
  const router = useRouter();
  const supportedAssetContext = React.useContext(SupportedAssetsContext);

  const supportedAssets = useMemo(() => {
    return supportedAssetContext.supportedAssets;
  }, [supportedAssetContext]);

  const [loading, setLoading] = React.useState(true);
  const web3Context = React.useContext(Web3Context);
  const [nft, setNFT] = React.useState<{ [index: string]: any }>();
  const [image, setImage] = React.useState<string>();
  const [extension, setFileExtension] = React.useState<string>();
  const [isPlaceABid, setIsPlaceABid] = React.useState<boolean>(false);
  const [modalState, setModalState] = React.useState<string>();
  const [currentBlock, setCurrentBlock] = React.useState<number>();
  const [error, setError] = React.useState(null);
  const [conversionRate, setConversionRate] = React.useState(-1);
  const [editableSerialNumber, setEditableSerialNumber] =
    React.useState<number>(undefined);
  const [listingInfo, setListingInfo] = React.useState<any>();
  const [txMessage, setTxMessage] = React.useState<any>();

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

        const currentBlock = (
          await web3Context.api.rpc.chain.getBlock()
        ).block.header.number.toNumber();
        setCurrentBlock(Number(currentBlock));

        const seriesIssuance = await web3Context.api.query.nft.seriesIssuance(
          router.query.collectionId,
          router.query.seriesId
        );
        const owner = await web3Context.api.query.nft.tokenOwner(
          [router.query.collectionId, router.query.seriesId],
          router.query.serialNumber
        );

        const { attributes } = tokenInfo;
        const nft: { [index: string]: any } = {
          collectionId: router.query.collectionId,
          seriesId: router.query.seriesId,
          serialNumber: router.query.serialNumber,
          owner: owner.toString(),
          showOne: true,
          tokenId: [
            router.query.collectionId,
            router.query.seriesId,
            router.query.serialNumber,
          ],
        };
        if (attributes) {
          const metadata = getMetadata(attributes);
          if (metadata) {
            const metadataAttributes = metadata.split(" ");
            const metaAsObject = metadataAttributes.length > 1;
            const key = metaAsObject
              ? metadataAttributes[0].toLowerCase()
              : "metadata";
            const value = metaAsObject
              ? metadataAttributes[1]
              : metadataAttributes[0];
            nft[key] = value;
            const metadataUrl = value.startsWith("ipfs://")
              ? `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${
                  value.split("ipfs://")[1]
                }`
              : value;
            nft.metadataLink = metadataUrl;
            axios.get(metadataUrl).then(function (response) {
              const { data } = response;
              const attr = [];
              Object.keys(data).forEach(function (key) {
                switch (key) {
                  case "title":
                    nft.title = data[key];
                    break;
                  case "description": {
                    nft.description = data[key];
                    break;
                  }
                  case "image": {
                    nft.imageLink = data.image.startsWith("ipfs://")
                      ? `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${
                          data.image.split("ipfs://")[1]
                        }`
                      : data.image;
                    break;
                  }
                  case "properties":
                    Object.entries(data.properties).map((d) => attr.push(d));
                    break;
                  default:
                    attr.push([key, data[key]]);
                    break;
                }
              });

              attributes.map((att) => {
                if (att["Text"]) {
                  try {
                    const data = JSON.parse(att["Text"]);
                    attr.push([Object.keys(data)[0], Object.values(data)[0]]);
                  } catch (e) {
                    // the older nfts created are not in json format
                    const data = att["Text"];
                    attr.push(["#", data]);
                  }
                }
              });
              nft.attributes = attr;
            });
          } else {
            nft.attributes = [];
          }
        }

        setNFT(nft);

        setLoading(false);
      });
    })();
  }, [
    web3Context.api,
    router.query.collectionId,
    router.query.seriesId,
    router.query.serialNumber,
  ]);

  useEffect(() => {
    if (!web3Context.api) {
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
        let valueForConversion = undefined;
        if (listingInfo) {
          const listing = (
            await web3Context.api.query.nft.listings(listingInfo.listingId)
          ).unwrapOrDefault();
          if (listing.isAuction) {
            const winningBidForListing =
              await web3Context.api.query.nft.listingWinningBid(
                listingInfo.listingId
              );
            let winningBid;
            if (winningBidForListing && winningBidForListing.toJSON()) {
              winningBid = winningBidForListing.toJSON()[1];
            }
            auctionInfo = listing.asAuction.toJSON();
            valueForConversion = winningBid
              ? Number(winningBid)
              : Number(auctionInfo.reservePrice);
            auctionInfo = {
              ...auctionInfo,
              winningBid: winningBid,
            };
          } else {
            fixedPriceInfo = listing.asFixedPrice.toJSON();
            valueForConversion = fixedPriceInfo.fixedPrice;
          }
        }

        setListingInfo({
          listingId: listingInfo?.listingId.toNumber(),
          auctionInfo: auctionInfo,
          fixedPriceInfo: fixedPriceInfo,
          valueForConversion: valueForConversion,
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
        const copyOwers = await web3Context.api.query.nft.tokenOwner.multi(
          copyParams
        );
        if (web3Context.account) {
          for (let i = 0; i < copyOwers.length; i++) {
            const isOwner =
              copyOwers[i].toString() ===
              web3Context.account.address.toString();
            const isOnSale = openListing.find((listing) => {
              return (
                listing.tokenId.collectionId.toNumber() ===
                  Number(router.query.collectionId) &&
                listing.tokenId.seriesId.toNumber() ===
                  Number(router.query.seriesId) &&
                listing.tokenId.serialNumber.toNumber() ===
                  Number(router.query.serialNumber)
              );
            });
            if (isOwner && !isOnSale) {
              setEditableSerialNumber(Number(router.query.serialNumber));
              break;
            }
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

  useEffect(() => {
    if (
      paymentAsset &&
      paymentAsset.symbol &&
      paymentAsset.symbol === "CENNZ" &&
      listingInfo
    ) {
      const price = web3Context.cennzUSDPrice;
      if (conversionRate === -1) {
        try {
          let conversionRateCal =
            (listingInfo.valueForConversion / 10 ** paymentAsset.decimals) *
            price;
          conversionRateCal = Number(conversionRateCal.toFixed(2));
          setConversionRate(conversionRateCal);
        } catch (e) {
          console.log("Error setting conversion rate");
        }
      }
    }
    //return undefined;
  }, [listingInfo, paymentAsset, web3Context.cennzUSDPrice]);

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
      if (
        web3Context.api &&
        web3Context.account &&
        listingInfo &&
        listingInfo.listingId >= 0
      ) {
        try {
          setModalState("txInProgress");
          await buyWithFixedPrice(
            web3Context.api,
            web3Context.account,
            listingInfo.listingId
          );
          setTxMessage("Sale success");
          setModalState("success");
        } catch (e) {
          setTxMessage("Error buying tokens for listing");
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

      if (web3Context.api && web3Context.account) {
        try {
          setModalState("txInProgress");
          await placeABid(
            web3Context.api,
            web3Context.account,
            listingInfo.listingId,
            priceInUnit
          );
          setTxMessage("Bid placed");
          setModalState("success");
        } catch (e) {
          console.log(":( transaction failed", e);
          setTxMessage("Bid failed");
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

  return (
    <>
      <Loader loading={loading} />
      <Link href="javascript:history.back()">
        <a className="font-bold" style={{ lineHeight: "31px" }}>
          &lt; Back
        </a>
      </Link>
      {nft ? (
        <div className="border border-litho-black mt-7 mb-6 flex flex-col h-full">
          <div className="border-b border-litho-black px-10 py-5 flex items-center">
            <Text variant="h3" component="h3" className="flex-1">
              {nft.title}
            </Text>
            {nft.fileType && (
              <Text variant="h6" className="mr-8">
                File Type:{" "}
                <span className="text-litho-black text-opacity-50">
                  {nft.fileType}
                </span>
              </Text>
            )}
            <Text variant="h6">
              Copies:{" "}
              <span className="text-litho-black text-opacity-50">
                {nft.copies}
              </span>
            </Text>
          </div>
          <div className="flex">
            <div className="w-2/3 border-r border-litho-black">
              <div
                className="border-b border-litho-black flex items-center justify-center"
                style={{ minHeight: "500px", maxHeight: "499px" }}
              >
                <NFT nft={nft} renderer={NFTRenderer} />
              </div>
              <div className="p-5 flex items-center justify-around">
                {nft.imageLink && (
                  <Link href={nft.imageLink}>
                    <a
                      className="text-litho-blue font-medium text-lg underline"
                      target="_blank"
                    >
                      View on IPFS
                    </a>
                  </Link>
                )}
                {nft.metadataLink && (
                  <Link href={nft.metadataLink}>
                    <a
                      className="text-litho-blue font-medium text-lg underline"
                      target="_blank"
                    >
                      IPFS Metadata
                    </a>
                  </Link>
                )}
              </div>
            </div>
            <div className="w-1/3">
              {!isPlaceABid ? (
                <>
                  {listingInfo &&
                    listingInfo.listingId >= 0 &&
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
                            {listingInfo.auctionInfo.winningBid && (
                              <>
                                <div className="flex justify-between">
                                  <Text
                                    variant="h6"
                                    className="text-opacity-50"
                                  >
                                    Current Bid
                                  </Text>
                                  <Text variant="h6">Reserve Met</Text>
                                </div>
                              </>
                            )}

                            {listingInfo.auctionInfo.winningBid &&
                            paymentAsset ? (
                              <>
                                <Text variant="h3" className="mt-6">
                                  {listingInfo.auctionInfo.winningBid /
                                    10 ** paymentAsset.decimals}{" "}
                                  {paymentAsset.symbol}
                                </Text>
                              </>
                            ) : (
                              <>
                                <Text variant="h3" className="mt-6">
                                  {reservePrice} {paymentAsset?.symbol}
                                </Text>
                              </>
                            )}
                          </>
                        )}
                        {conversionRate >= 0 && (
                          <>
                            <Text variant="h6" className="text-opacity-50">
                              ({conversionRate} USD)
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
                              onClick={buyNow}
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
                    <Text variant="h6">Owner</Text>
                    <Text variant="h6" className="text-opacity-50">
                      {nft.owner.substr(0, 8)}...{nft.owner.substr(-8)}{" "}
                      {web3Context.account
                        ? web3Context.account.address === nft.owner
                          ? "(You)"
                          : null
                        : null}
                    </Text>
                    {editableSerialNumber !== undefined && (
                      <div className="w-full flex-col md:flex-row flex items-center justify-between mt-10">
                        <Link
                          href={`/sell?collectionId=${router.query.collectionId}&seriesId=${router.query.seriesId}&serialNumber=${editableSerialNumber}`}
                        >
                          <a className="w-full md:w-auto border bg-litho-blue flex-1 mt-4 md:mt-0 md:ml-6 text-center py-2">
                            <Text variant="button" color="white">
                              SELL
                            </Text>
                          </a>
                        </Link>
                      </div>
                    )}
                  </div>
                  {nft.description && (
                    <div className="w-full p-8 flex flex-col border-b border-litho-black">
                      <Text variant="h6">Description</Text>
                      <Text
                        variant="body2"
                        className="text-opacity-50 break-all"
                      >
                        {nft.description}
                      </Text>
                    </div>
                  )}
                  {nft.attributes && nft.attributes.length > 0 && (
                    <div className="w-full p-8 flex flex-col border-b border-litho-black">
                      <Text variant="h6">Attributes</Text>
                      {nft.attributes.map((attribute) => {
                        if (!attribute) {
                          return null;
                        }
                        // for the nft initially created, metadata on ipfs has attribute as owner, we want it to be creator
                        if (attribute[0] === "owner") {
                          attribute[0] = "creator";
                        }
                        return (
                          <Text
                            variant="body1"
                            className="text-opacity-50 break-all my-2"
                            key={attribute}
                          >
                            {`${attribute[0]}: ${attribute[1]}`}
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
                  <form onSubmit={confirmBid}>
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
                        Once a bid is placed it can't be withdrawn
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
      ) : !loading ? (
        <div className="border border-litho-black h-customScreen flex items-center justify-center text-4xl text-litho-black text-opacity-50">
          Could not load NFT
        </div>
      ) : null}
      {modalState && (
        <TxStatusModal
          successLink={`/marketplace`}
          errorLink={"/marketplace"}
          modalState={modalState}
          setModalState={setModalState}
          message={txMessage}
        />
      )}
    </>
  );
};

export default NFTDetail;
