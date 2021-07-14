import React from "react";

import Modal from "../Modal";
import Text from "../Text";

interface Props {
  closeModal: () => void;
  connectWallet: () => void;
}

const ConnectWalletModal: React.FC<Props> = ({ closeModal, connectWallet }) => {
  return (
    <Modal
      onClose={closeModal}
      styles={{
        modalBody: "w-2/6 absolute top-20 right-20",
        modalContainer: "z-10",
      }}
    >
      <Text component="h4" variant="h4" color="litho-blue">
        Connect Wallet
      </Text>
      <Text variant="body1" className="mt-4" component="div">
        Connect with one of our available wallet providers or create a new one.
      </Text>
      <div className="h-0.5 w-full my-6 bg-litho-black bg-opacity-10" />
      <button
        className="border border-litho-black border-opacity-20 flex items-center justify-center bg-litho-cream w-full py-3 h-12"
        onClick={() => {
          connectWallet();
          closeModal();
        }}
      >
        <img src="/cennznet-logo.svg" className="mr-2" />
        <Text variant="button" color="litho-blue">
          CENNZnet Wallet
        </Text>
      </button>
    </Modal>
  );
};

export default ConnectWalletModal;
