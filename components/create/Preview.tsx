import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import Text from "../Text";
import NFT from "../NFT";
import Modal from "../Modal";
import Web3Context from "../Web3Context";

interface Props {
  nft: any;
  mint: () => void;
  transactionFee: number;
}

const Preview: React.FC<Props> = ({ nft, mint, transactionFee }) => {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showLoader, setShowLoader] = React.useState(false);
  const [nftMinted, setNFTMinted] = React.useState(false);
  const web3Context = React.useContext(Web3Context);

  const router = useRouter();

  const mintNFT = async () => {
    setShowLoader(true);
    await mint();
    setShowLoader(false);
    setShowSuccess(true);
    setNFTMinted(true);
  };

  const isBalanceLow =
    transactionFee &&
    transactionFee > web3Context.account.balances.CPAY.balance;

  return (
    <div className="flex flex-col w-3/5 m-auto">
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
          disableOutsideClick
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
