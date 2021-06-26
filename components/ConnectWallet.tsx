import React from "react";

import Web3Context from "./Web3Context";
import Text from "./Text";
import Modal from "./Modal";

const ConnectWallet: React.FC<{}> = () => {
  const web3Context = React.useContext(Web3Context);
  const [showUserAccount, setShowUserAccount] = React.useState(false);
  const [showWallet, setShowWallet] = React.useState(false);

  React.useEffect(() => {
    if (web3Context.account) {
      setShowUserAccount(true);
    } else {
      setShowUserAccount(false);
    }
  }, [web3Context.account]);

  return (
    <>
      <button
        className="border border-litho-wallet ml-9 flex items-center flex-1 pl-1 pr-3 py-2 w-40"
        onClick={() => {
          // web3Context.connectWallet();
          setShowWallet(true);
        }}
        disabled={showUserAccount && web3Context.account}
      >
        <img src="/wallet.svg" alt="Connect Wallet" className="mr-2" />
        <Text
          variant="button"
          color="litho-blue"
          className="flex-1 text-center"
        >
          {showUserAccount && web3Context.account
            ? "Connected"
            : "Connect Wallet"}
        </Text>
      </button>
      {showWallet && (
        <Modal
          onClose={() => setShowWallet(false)}
          styles={{
            modalBody: "w-2/6 bg-white absolute top-20 right-20",
          }}
        >
          <Text component="h4" variant="h4" color="litho-blue">
            Connect Wallet
          </Text>
          <Text variant="body1" className="mt-4" component="div">
            Connect with one of our available wallet providers or create a new
            one.
          </Text>
          <div className="h-0.5 w-full my-6 bg-litho-black bg-opacity-10" />
          <button
            className="border border-litho-black border-opacity-20 flex items-center justify-center bg-litho-cream w-full py-3 h-12"
            onClick={() => {
              web3Context.connectWallet();
              setShowWallet(false);
            }}
          >
            <img src="/cennznet-logo.svg" className="mr-2" />
            <Text variant="button" color="litho-blue">
              CENNZnet Wallet
            </Text>
          </button>
        </Modal>
      )}
    </>
  );
};

export default ConnectWallet;
