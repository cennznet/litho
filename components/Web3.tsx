import React from "react";
import { web3Enable, web3Accounts } from "@polkadot/extension-dapp";

const Web3: React.FC<{}> = () => {
  React.useEffect(() => {
    (async () => {
      const allInjected = await web3Enable("my cool dapp");
      const allAccounts = await web3Accounts();
      console.log(allInjected, allAccounts);
    })();
  }, []);
  return null;
};

export default Web3;
