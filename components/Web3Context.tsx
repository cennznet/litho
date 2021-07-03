// Need to create the context in a separate file as the Web3 component imports @polkadot/extension-dapp package which doesn't work during SSR
import React from "react";

const Web3Context = React.createContext({
  hasWeb3injected: false,
  connectWallet: (callback?: () => void) => {},
  extension: null,
  account: null,
  api: null,
});

export default Web3Context;
