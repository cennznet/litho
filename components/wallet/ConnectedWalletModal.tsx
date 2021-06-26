import React from "react";
import Link from "next/link";

import Modal from "../Modal";
import Text from "../Text";
import Web3Context from "../Web3Context";

interface Props {
  closeModal: () => void;
}

const ConnectedWalletModal: React.FC<Props> = ({ closeModal }) => {
  const web3Context = React.useContext(Web3Context);

  return (
    <Modal
      onClose={closeModal}
      styles={{
        modalBody: "w-3/12 bg-white absolute top-20 right-20 shadow-md",
        modalContainer: "-z-10",
      }}
      hideClose
    >
      <Text component="h4" variant="h4" color="litho-blue">
        Wallet name
      </Text>
      <Text variant="body1" className="mt-4" component="div">
        wallet address
      </Text>
      <div className="h-0.5 w-full my-6 bg-litho-black bg-opacity-10" />
      <Text variant="subtitle1">Balance</Text>

      <div className="mt-4 mb-6">
        <div className="flex items-center">
          <div className="h-12 w-12 bg-gray-200 mr-4"></div>
          <Text variant="subtitle1">1000</Text>&nbsp;
          <Text variant="body1">CENNZ</Text>
        </div>
      </div>
      <Link href="https://cennzx.centrality.me/">
        <a
          className="flex items-center justify-center bg-litho-blue w-full py-3 h-12"
          target="_blank"
        >
          <Text variant="button" color="white">
            Top up
          </Text>
        </a>
      </Link>
      <div className="flex items-center mt-4">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mr-1"
        >
          <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="#191B1D" />
          <path
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
            fill="#191B1D"
          />
        </svg>

        <span
          className="font-semibold text-base"
          style={{ lineHeight: "18px", letterSpacing: "0.01em" }}
        >
          How does it work?
        </span>
      </div>
      <div className="h-0.5 w-full my-8 bg-litho-black bg-opacity-10" />
      <Link href="/me">
        <a>
          <Text variant="button" color="litho-blue">
            My NFTs
          </Text>
        </a>
      </Link>
      <br />
      <button
        onClick={() => web3Context.extension.provider.disconnect()}
        className="mt-6"
      >
        <Text variant="button" color="litho-blue">
          Disconnect
        </Text>
      </button>
    </Modal>
  );
};

export default ConnectedWalletModal;
