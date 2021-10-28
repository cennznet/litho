import React from "react";
import IPFSGatewayTools from "@pinata/ipfs-gateway-tools/dist/browser";
import axios from "axios";
import cache from "../../utils/cache";
const gatewayTools = new IPFSGatewayTools();

const NFTDataWrapper: React.FC<{
  nft: any;
  thumbnail?: boolean;
  renderer: React.FC<{ nft: any; thumbnail?: boolean; error: any }>;
}> = ({ nft, thumbnail, renderer: Renderer }) => {
  const [nftData, setNFTData] = React.useState(nft);
  const [nftError, setError] = React.useState<string>(null);
  const [metadataUrl, setMetadataUrl] = React.useState(null);

  React.useEffect(() => {
    if (nftData.metadata && nftData.metadata !== "undefined") {
      try {
        const metaURL = nft.metadata.startsWith("ipfs://")
          ? gatewayTools.convertToDesiredGateway(
              nft.metadata,
              process.env.NEXT_PUBLIC_PINATA_GATEWAY
            )
          : nft.metadata;
        setMetadataUrl(metaURL);
      } catch (e) {
        console.log(`Failed with CID err for URI ${nft.metadata} .... ${e}`);
        setError("Metadata not found");
      }
    }
  }, [nftData]);

  React.useEffect(() => {
    if (!nft.metadata) {
      setError("Metadata not found");
    }
    if (metadataUrl) {
      const showSerialNo = nftData.tokenId ? Number(nftData.tokenId[2]) + 1 : 0;
      if (cache.has(metadataUrl)) {
        const metadata = cache.get(metadataUrl);
        // if found in cache, update the copies
        if (nftData.showOne) {
          if (
            metadata.originalCopies &&
            metadata.originalCopies.toString() !== "1"
          ) {
            metadata.copies = 1;
            metadata.name = `${
              metadata.name.split("-")[0]
            } - [${showSerialNo}/${metadata.originalCopies}]`;
          }
        } else {
          metadata.name = metadata.name.split("-")[0];
          metadata.copies = metadata.originalCopies
            ? metadata.originalCopies
            : metadata.copies;
        }
        setNFTData({ ...nft, ...metadata });
      } else {
        axios
          .get(metadataUrl)
          .then(function (response) {
            const { data } = response;
            if (data) {
              const metadata = {
                name:
                  nftData.showOne &&
                  data.properties &&
                  data.properties.quantity &&
                  data.properties.quantity.toString() !== "1"
                    ? `${data.name} - [${showSerialNo}/${
                        data.properties && data.properties.quantity
                      }]`
                    : data.name,
                description: data.description,
                image: data.image.startsWith("ipfs://")
                  ? gatewayTools.convertToDesiredGateway(
                      data.image,
                      process.env.NEXT_PUBLIC_IMAGE_CDN
                    )
                  : data.image,
                copies: nftData.showOne
                  ? 1
                  : (data.properties && data.properties.quantity) || 1,
                owner: data.properties && data.properties.owner,
                file:
                  data.properties && data.properties.file
                    ? gatewayTools.convertToDesiredGateway(
                        data.properties.file,
                        process.env.NEXT_PUBLIC_PINATA_GATEWAY
                      )
                    : null,
                extension: data.properties && data.properties.extension,
                coverFileExtension:
                  data.properties && data.properties.coverFileExtension,
                metadata: gatewayTools.convertToDesiredGateway(
                  nft.metadata,
                  process.env.NEXT_PUBLIC_PINATA_GATEWAY
                ),
                originalCopies: data.properties && data.properties.quantity,
              };
              cache.set(metadataUrl, metadata);
              setNFTData({ ...nft, ...metadata });
            }
          })
          .catch((error) => {
            if (error) {
              if (nft.metadata.startsWith("ipfs://")) {
                setMetadataUrl(
                  gatewayTools.convertToDesiredGateway(
                    nft.metadata,
                    process.env.NEXT_PUBLIC_PINATA_GATEWAY
                  )
                );
              } else {
                setError(error.message);
              }
            }
          });
      }
    }
  }, [metadataUrl]);

  if (!nftData.image && !nftError) {
    return null;
  }

  return <Renderer nft={nftData} thumbnail={thumbnail} error={nftError} />;
};

export default NFTDataWrapper;
