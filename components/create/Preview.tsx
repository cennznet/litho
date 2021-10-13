import React from "react";
import Link from "next/link";

import Text from "../Text";
import NFTRenderer from "../nft/NFTRenderer";
import Web3Context from "../Web3Context";

interface Props {
  nft: any;
  mint: () => void;
  transactionFee: number;
  goBack: () => void;
}

const Preview: React.FC<Props> = ({ nft, mint, transactionFee, goBack }) => {
  const [nftMinted, setNFTMinted] = React.useState(false);
  const web3Context = React.useContext(Web3Context);

  const mintNFT = async () => {
    try {
      await mint();
      setNFTMinted(true);
    } catch (error) {}
  };

  const isBalanceLow =
    transactionFee &&
    transactionFee > web3Context.account.balances.CPAY.balance;

  return (
    <div className="flex flex-col lg:w-3/5 m-auto">
      <div className="flex flex-col items-center">
        <NFTRenderer nft={nft} />
        {transactionFee && (
          <div className="mt-10">
            <Text variant="body1" className="text-opacity-60">
              Estimated transaction fee:
            </Text>{" "}
            <Text variant="body1">{Math.ceil(transactionFee)} CPAY</Text>
          </div>
        )}
        {isBalanceLow && (
          <div className="mt-2">
            <Text variant="body1" color="litho-red" component="div">
              You don’t have enough balance in your wallet.{" "}
              <Link href="https://www.mexc.com">
                <a className="underline font-bold" target="_blank">
                  Top Up
                </a>
              </Link>
            </Text>
          </div>
        )}
      </div>
      {!nftMinted && (
        <div className="w-full flex items-center justify-between mt-16">
          <button
            className="border border-litho-blue bg-litho-cream flex-1 text-center py-2"
            onClick={goBack}
          >
            <Text variant="button" color="litho-blue">
              BACK
            </Text>
          </button>
          <button
            className={`border bg-litho-blue flex-1 ml-6 text-center py-2 ${
              isBalanceLow ? "bg-opacity-60 cursor-not-allowed" : ""
            }`}
            onClick={mintNFT}
            disabled={isBalanceLow}
          >
            <Text variant="button" color="white">
              MINT
            </Text>
          </button>
        </div>
      )}
    </div>
  );
};

export default Preview;
