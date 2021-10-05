import React from "react";
import useSWR from "swr";
import IPFSGatewayTools from "@pinata/ipfs-gateway-tools/dist/browser";
const gatewayTools = new IPFSGatewayTools();

const NFTDataWrapper: React.FC<{
  nft: any;
  renderer: React.FC<{ nft: any; error: any }>;
}> = ({ nft, renderer: Renderer }) => {
  const [nftData, setNFTData] = React.useState(nft);
  const [nftError, setError] = React.useState<string>(null);
  const [metadataUrl, setMetadataUrl] = React.useState(
    nft.metadata && nft.metadata !== "undefined"
      ? nft.metadata.startsWith("ipfs://")
        ? gatewayTools.convertToDesiredGateway(
            nft.metadata,
            process.env.NEXT_PUBLIC_PINATA_GATEWAY
          )
        : nft.metadata
      : null
  );

  const { data, error } = useSWR(metadataUrl);

  React.useEffect(() => {
    if (!nft.metadata) {
      setError("Metadata not found");
    }

    if (data) {
      const metadata = {
        name: data.name,
        description: data.description,
        image: data.image.startsWith("ipfs://")
          ? gatewayTools.convertToDesiredGateway(
              data.image,
              process.env.NEXT_PUBLIC_PINATA_GATEWAY
            )
          : data.image,
        copies: (data.properties && data.properties.quantity) || 1,
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
      };
      setNFTData({ ...nft, ...metadata });
    }

    if (error) {
      if (nft.metadata.startsWith("ipfs://")) {
        setMetadataUrl(
          gatewayTools.convertToDesiredGateway(
            nft.metadata,
            "https://ik.imagekit.io/i4ryln6htzn"
          )
        );
      } else {
        setError(error.message);
      }
    }
  }, [data, error]);

  if (!nftData.image && !nftError) {
    return null;
  }

  return <Renderer nft={nftData} error={nftError} />;
};

export default NFTDataWrapper;
