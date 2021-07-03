import React from "react";

import Web3Context from "./Web3Context";
import Text from "./Text";
import ConnectWalletModal from "./wallet/ConnectWalletModal";
import ConnectedWalletModal from "./wallet/ConnectedWalletModal";

const ConnectWallet: React.FC<{}> = () => {
  const web3Context = React.useContext(Web3Context);
  const [isWalletConnected, setIsWalletConnected] = React.useState(false);
  const [showWallet, setShowWallet] = React.useState(false);
  const [showConnectedWallet, setShowConnectedWallet] = React.useState(false);

  React.useEffect(() => {
    if (web3Context.account) {
      setIsWalletConnected(true);
    } else {
      setIsWalletConnected(false);
    }
  }, [web3Context.account]);

  const buttonClickHandler: React.EventHandler<React.SyntheticEvent> = (
    event: React.SyntheticEvent
  ) => {
    if (isWalletConnected) {
      setShowConnectedWallet((val) => !val);
    } else {
      setShowWallet((val) => !val);
    }
  };

  return (
    <>
      <button
        className="border border-litho-wallet ml-9 flex items-center justify-center flex-1 pl-1 pr-3 py-2 w-40"
        onClick={buttonClickHandler}
      >
        <img src="/wallet.svg" alt="Connect Wallet" className="mr-2" />
        <Text variant="button" color="litho-blue">
          {isWalletConnected && web3Context.account.balances
            ? `${web3Context.account.balances.cennz} CENNZ`
            : "Connect Wallet"}
        </Text>
      </button>
      {showWallet && (
        <ConnectWalletModal
          closeModal={() => setShowWallet(false)}
          connectWallet={() => web3Context.connectWallet()}
        />
      )}
      {showConnectedWallet && (
        <ConnectedWalletModal
          closeModal={() => setShowConnectedWallet(false)}
        />
      )}
    </>
  );
};

export default ConnectWallet;
