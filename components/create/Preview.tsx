import React from "react";
import Link from "next/link";

import Text from "../Text";
import NFT from "../NFT";
import Web3Context from "../Web3Context";

interface Props {
  nft: any;
  mint: () => void;
  transactionFee: number;
}

const Preview: React.FC<Props> = ({ nft, mint, transactionFee }) => {
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
        <NFT nft={nft} />
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
              <Link href="https://cennzx.io/">
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
          <Link href="/">
            <a className="border bg-litho-cream flex-1 text-center py-2">
              <Text variant="button" color="litho-blue">
                Cancel
              </Text>
            </a>
          </Link>
          <button
            className={`border bg-litho-blue flex-1 ml-6 text-center py-2 ${
              isBalanceLow ? "bg-opacity-60" : ""
            }`}
            onClick={mintNFT}
            disabled={isBalanceLow}
          >
            <Text variant="button" color="white">
              Mint
            </Text>
          </button>
        </div>
      )}
    </div>
  );
};

export default Preview;
