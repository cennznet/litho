import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import useSWR from "swr";
// import IPFSGatewayTools from '@pinata/ipfs-gateway-tools/dist/browser';
// const gatewayTools = new IPFSGatewayTools();

import Web3Context from "../../../../components/Web3Context";
import Text from "../../../../components/Text";
import getFileExtension from "../../../../utils/getFileExtension";
import isImageOrVideo from "../../../../utils/isImageOrVideo";
import getMetadata from "../../../../utils/getMetadata";
import NFT from "../../../../components/nft";

const NFTDetailRenderer: React.FC<{ nft: any; error: any }> = ({
  nft,
  error,
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
        const metadata = getMetadata(attributes);

        const nft: { [index: string]: any } = {
          collectionId: router.query.collectionId,
          seriesId: router.query.seriesId,
          serialNumber: router.query.serialNumber,
          owner,
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

  return (
    <>
      <Link href="/me">
        <a className="font-bold" style={{ lineHeight: "31px" }}>
          &lt; My Profile
        </a>
      </Link>

      {nft && <NFT nft={nft} renderer={NFTDetailRenderer} />}
    </>
  );
};

export default NFTDetail;
