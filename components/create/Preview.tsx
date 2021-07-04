import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import Text from "../Text";
import NFT from "../NFT";
import Modal from "../Modal";

interface Props {
  nft: any;
  mint: () => void;
}

const Preview: React.FC<Props> = ({ nft, mint }) => {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showLoader, setShowLoader] = React.useState(false);
  const [nftMinted, setNFTMinted] = React.useState(false);

  const router = useRouter();

  const mintNFT = async () => {
    setShowLoader(true);
    await mint();
    setShowLoader(false);
    setShowSuccess(true);
    setNFTMinted(true);
  };

  return (
    <div className="flex flex-col w-3/5 m-auto">
      <div>
        <NFT nft={nft} />
      </div>
      {!nftMinted && (
        <div className="w-full flex items-center justify-between mt-16">
          <Link href="/">
            <a className="border bg-litho-cream flex-1 text-center py-2">
              <Text variant="button" color="litho-blue">
                Cancel
              </Text>
            </a>
          </Link>
          <button
            className="border bg-litho-blue flex-1 ml-6 text-center py-2"
            onClick={mintNFT}
          >
            <Text variant="button" color="white">
              Mint
            </Text>
          </button>
        </div>
      )}

      {showSuccess && (
        <Modal
          onClose={() => {
            setShowSuccess(false);
            router.push("/");
          }}
          styles={{
            modalBody: "w-3/6 flex flex-col",
            modalContainer: "z-10",
          }}
        >
          <Text variant="h4" color="litho-blue" component="h2" className="mb-6">
            Congratulations!
          </Text>
          <Text
            variant="body1"
            color="black"
            className="mt-2 border-b border-black border-opacity-20 pb-6"
          >
            NFT was successfully minted and should be displayed in your wallet
            shortly.
          </Text>
          <div className="self-end flex items-center mt-8">
            <Link href="/me">
              <a className="ml-4 rounded-sm bg-litho-blue px-4 py-3">
                <Text variant="button" color="white">
                  View Your NFT
                </Text>
              </a>
            </Link>
          </div>
        </Modal>
      )}

      {showLoader && (
        <Modal
          hideClose
          styles={{
            modalBody: "w-2/6",
            modalContainer: "z-10",
          }}
        >
          <Text variant="h4" color="litho-blue" component="h2" className="mb-6">
            Minting NFT...
          </Text>
        </Modal>
      )}
    </div>
  );
};

export default Preview;
