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

  const { data, error } = useSWR(
    nft.metadata && nft.metadata !== "undefined"
      ? gatewayTools.convertToDesiredGateway(
          nft.metadata,
          process.env.NEXT_PUBLIC_PINATA_GATEWAY
        )
      : null
  );

  React.useEffect(() => {
    if (!nft.metadata) {
      setError("Metadata not found");
    }

    if (data) {
      const metadata = {
        name: data.name,
        description: data.description,
        image: gatewayTools.convertToDesiredGateway(
          data.image,
          process.env.NEXT_PUBLIC_PINATA_GATEWAY
        ),
        copies: data.properties.quantity,
        owner: data.properties.owner,
        file: data.properties.file
          ? gatewayTools.convertToDesiredGateway(
              data.properties.file,
              process.env.NEXT_PUBLIC_PINATA_GATEWAY
            )
          : null,
        extension: data.properties.extension,
        coverFileExtension: data.properties.coverFileExtension,
        metadata: gatewayTools.convertToDesiredGateway(
          nft.metadata,
          process.env.NEXT_PUBLIC_PINATA_GATEWAY
        ),
      };
      setNFTData({ ...nft, ...metadata });
    }

    if (error) {
      setError(error.message);
    }
  }, [data, error]);

  if (!nftData.image && !nftError) {
    return null;
  }

  return <Renderer nft={nftData} error={nftError} />;
};

export default NFTDataWrapper;
