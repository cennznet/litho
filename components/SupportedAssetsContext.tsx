// Need to create the context in a separate file as the Web3 component imports @polkadot/extension-dapp package which doesn't work during SSR
import React from "react";

const SupportedAssetsContext = React.createContext({
  supportedAssets: [],
});

export default SupportedAssetsContext;
