import React from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

import Web3Context from "../../../../components/Web3Context";
import Text from "../../../../components/Text";
import getFileExtension from "../../../../utils/getFileExtension";

const NFTDetail: React.FC<{}> = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const web3Context = React.useContext(Web3Context);
  const [nft, setNFT] = React.useState<{ [index: string]: any }>();
  const [image, setImage] = React.useState<string>();

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

        const seriesIssuance = await web3Context.api.query.nft.seriesIssuance(
          router.query.collectionId,
          router.query.seriesId
        );

        const { attributes, owner } = tokenInfo;
        const nft: { [index: string]: any } = {
          collectionId: router.query.collectionId,
          seriesId: router.query.seriesId,
          serialNumber: router.query.serialNumber,
          owner,
          copies: seriesIssuance.toJSON(),
        };
        const otherAttributes = [];

        attributes.forEach(({ Text, Url }) => {
          const attributeString = Text || Url;
          if (attributeString) {
            const attributeBreakup = attributeString.split(" ");
            switch (attributeBreakup[0]) {
              case "Image-URL":
                nft.image = attributeBreakup[1];
                break;
              case "Metadata-URL":
                nft.metadata = attributeBreakup[1];
                break;
              case "Title":
                const [_, ...words] = attributeBreakup;
                nft.title = words.join(" ");
              case "Description":
                const [, ...description] = attributeBreakup;
                nft.description = description.join(" ");
                break;
              case "File-Type":
                const [, ...fileType] = attributeBreakup;
                nft.fileType = fileType;
                break;
              case "Quantity":
                break;
              default:
                otherAttributes.push(attributeString);
                break;
            }
          }
        });
        nft.attributes = otherAttributes;
        setNFT(nft);

        let imageUrl;
        const image = nft.coverImage || nft.image;
        const fileExtension = getFileExtension(image);

        if (!fileExtension) {
          imageUrl = "/litho-default.jpg";
        } else {
          if (typeof image === "object") {
            imageUrl = URL.createObjectURL(image);
          } else {
            imageUrl = image;
          }
        }
        setImage(imageUrl);
        setLoading(false);
      });
    })();
  }, [
    web3Context.api,
    router.query.collectionId,
    router.query.seriesId,
    router.query.serialNumber,
  ]);

  return (
    <>
      <Link href="/me">
        <a className="font-bold" style={{ lineHeight: "31px" }}>
          &lt; My Single NFTs
        </a>
      </Link>
      {image ? (
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
                <img
                  src={image}
                  className="object-contain object-center bg-image-loading bg-no-repeat bg-center"
                  onLoad={(event) => {
                    console.log("image loaded", event);
                    if (event.target) {
                      (event.target as HTMLImageElement).classList.remove(
                        "bg-image-loading"
                      );
                    }
                  }}
                  onError={(event) => {
                    (event.target as HTMLImageElement).src =
                      "/litho-default.jpg";
                    (event.target as HTMLImageElement).style.height = "499px";
                  }}
                  style={{ maxHeight: "499px" }}
                />
              </div>
              <div className="p-5 flex items-center justify-around">
                <Link href="https://cennznet.io/#/explorer">
                  <a
                    className="text-litho-blue font-medium text-lg underline"
                    target="_blank"
                  >
                    View on Explorer
                  </a>
                </Link>
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
              </div>
            </div>
            <div className="w-1/3">
              <div className="w-full p-8 flex flex-col border-b border-litho-black">
                <Text variant="h6">Creator</Text>
                <Text variant="h6" className="text-opacity-50">
                  {nft.owner.substr(0, 8)}...{nft.owner.substr(-8)}{" "}
                  {web3Context.account
                    ? web3Context.account.address === nft.owner
                      ? "(You)"
                      : null
                    : null}
                </Text>
              </div>
              {nft.description && (
                <div className="w-full p-8 flex flex-col border-b border-litho-black">
                  <Text variant="h6">Description</Text>
                  <Text variant="body2" className="text-opacity-50">
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
                    return (
                      <Text
                        variant="body1"
                        className="text-opacity-50 break-all my-2"
                        key={attribute}
                      >
                        {attribute}
                      </Text>
                    );
                  })}
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
    </>
  );
};

export default NFTDetail;
