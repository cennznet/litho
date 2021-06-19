import React from "react";
import Link from "next/link";

import NFT from "../NFT";

interface Props {
  aboutNFT: any;
  nftData: any;
}

const Preview: React.FC<Props> = ({ aboutNFT, nftData }) => {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [nftMinted, setNFTMinted] = React.useState(false);

  return (
    <div className="flex flex-col w-3/5 m-auto">
      <div>
        <NFT aboutNFT={aboutNFT} nftData={nftData} />
      </div>
      {!nftMinted && (
        <div className="w-full flex items-center justify-between mt-16">
          <Link href="/">
            <a className="border bg-litho-cream text-base text-litho-blue flex-1 text-center py-2">
              Cancel
            </a>
          </Link>
          <button
            className="border bg-litho-blue text-base text-white flex-1 ml-6 text-center py-2"
            onClick={() => {
              setShowSuccess(true);
              setNFTMinted(true);
            }}
          >
            Mint
          </button>
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-0 left-0 h-full w-full bg-litho-cream bg-opacity-75 flex items-center justify-center z-20">
          <div className="px-4 pb-5 bg-white flex flex-col text-litho-blue w-1/2 h-54 shadow-md">
            <button
              className="h-10 self-end text-2xl font-light"
              onClick={() => setShowSuccess(false)}
            >
              &times;
            </button>
            <h2 className="text-3xl font-bold text-litho-blue mb-6">
              Congratulations!
            </h2>
            <span className="text-black mt-2 font-light border-b border-black border-opacity-20 pb-6">
              NFT was successfully minted and should be displayed in your wallet
              shortly.
            </span>
            <div className="self-end flex items-center mt-8">
              <Link href="/me">
                <a
                  target="_blank"
                  className="ml-4 rounded-sm text-white bg-litho-blue px-4 py-3"
                >
                  View Your NFT
                </a>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Preview;
