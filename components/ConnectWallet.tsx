import React from "react";

import Web3Context from "./Web3Context";
import Text from "./Text";

const ConnectWallet: React.FC<{}> = () => {
  const web3Context = React.useContext(Web3Context);
  const [showUserAccount, setShowUserAccount] = React.useState(false);

  React.useEffect(() => {
    if (web3Context.account) {
      setShowUserAccount(true);
    } else {
      setShowUserAccount(false);
    }
  }, [web3Context.account]);

  return showUserAccount && web3Context.account ? (
    <div
      className="border border-litho-wallet ml-9 flex items-center flex-1 pl-1 pr-2 py-2 w-40"
      onClick={() => {
        web3Context.connectWallet();
      }}
    >
      <div className="w-2 h-2 rounded-full bg-green-500 ml-1 mr-4" />
      {web3Context.account.meta.name}
    </div>
  ) : (
    <button
      className="border border-litho-wallet ml-9 flex items-center justify-between flex-1 pl-1 pr-2 py-2"
      onClick={() => {
        web3Context.connectWallet();
      }}
    >
      <img src="/wallet.svg" alt="Connect Wallet" className="mr-4" />
      <Text variant="button" color="litho-blue">
        Connect Wallet
      </Text>
    </button>
  );
};

export default ConnectWallet;
