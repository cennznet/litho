import React from "react";
import {
  web3Enable,
  web3Accounts,
  web3AccountsSubscribe,
} from "@polkadot/extension-dapp";
import Link from "next/link";

import Web3Context from "./Web3Context";

const Web3: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [hasWeb3injected, setHasWeb3Injected] = React.useState(false);
  const [extension, setExtension] = React.useState(null);
  const [accountsUnsubscribe, setAccountsUnsubsribe] = React.useState(null);
  const [account, setAccount] = React.useState(null);
  const [showNoExtensionMessage, setShowNoExtensionMessage] =
    React.useState(false);
  const [showZeroAccountMessage, setShowZeroAccountMessage] =
    React.useState(false);
  const [isRefresh, setIsRefresh] = React.useState(false);

  const connectWallet = async () => {
    console.log("connect wallet clicked");
    if (accountsUnsubscribe) {
      accountsUnsubscribe();
    }
    try {
      const extensions = await web3Enable("Litho");
      if (extensions.length === 0) {
        throw new Error("No extension found");
      }

      const polkadotExtension = extensions.find(
        (ext) => ext.name === "polkadot-js"
      );
      // const metadata = polkadotExtension.metadata;
      // const checkIfMetaUpdated = localStorage.getItem(`EXTENSION_META_UPDATED`);
      // if (!checkIfMetaUpdated) {
      //     const metadataDef = await extractMeta(apiInstance);
      //     await metadata.provide(metadataDef);
      //     localStorage.setItem(`EXTENSION_META_UPDATED`, 'true');
      // }
      let unsubscribe = await web3AccountsSubscribe((injectedAccounts) => {
        if (injectedAccounts.length === 0) {
          setAccount(null);
          setShowZeroAccountMessage(true);
        } else {
          setAccount(injectedAccounts[0]);
          setShowZeroAccountMessage(false);
        }
      });
      setAccountsUnsubsribe(unsubscribe);
      setExtension(polkadotExtension);
      setHasWeb3Injected(true);
    } catch (error) {
      setShowNoExtensionMessage(true);
      setHasWeb3Injected(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (accountsUnsubscribe) {
        accountsUnsubscribe();
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        hasWeb3injected,
        connectWallet,
        extension,
        account,
      }}
    >
      {children}

      {showNoExtensionMessage && (
        <div className="fixed top-0 left-0 h-full w-full bg-litho-cream bg-opacity-75 flex items-center justify-center">
          <div className="px-4 pb-8 bg-white flex flex-col justify-between text-litho-blue">
            <button
              className="h-12 self-end text-2xl font-light"
              onClick={() => setShowNoExtensionMessage(false)}
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold">
              Please install the CENNZnet Wallet Extension
            </h3>
            <span className="text-sm text-black mt-2 font-light">
              Refresh this page after installing the extension
            </span>
            <div className="self-end flex items-center mt-8">
              <button onClick={() => setShowNoExtensionMessage(false)}>
                Cancel
              </button>
              <Link href="https://chrome.google.com/webstore/detail/cennznet-extension/feckpephlmdcjnpoclagmaogngeffafk">
                <a
                  target="_blank"
                  className="ml-4 rounded-sm text-sm text-white bg-litho-blue px-2 py-1"
                  onClick={
                    isRefresh
                      ? () => window.location.reload()
                      : () => setIsRefresh(true)
                  }
                >
                  {isRefresh ? "Refresh" : "Install"}
                </a>
              </Link>
            </div>
          </div>
        </div>
      )}

      {showZeroAccountMessage && (
        <div className="fixed top-0 left-0 h-full w-full bg-litho-cream bg-opacity-75 flex items-center justify-center">
          <div className="px-4 pb-8 bg-white flex flex-col justify-between text-litho-blue">
            <button
              className="h-12 self-end text-2xl font-light"
              onClick={() => setShowZeroAccountMessage(false)}
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold">
              Please create an account in the wallet extension
            </h3>
            <span className="text-sm text-black mt-2 font-light">
              Your wallet currently has 0 zero accounts
            </span>
            <div className="self-end flex items-center mt-8">
              <button
                className="ml-4 rounded-sm text-sm text-white bg-litho-blue px-2 py-1"
                onClick={() => setShowZeroAccountMessage(false)}
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </Web3Context.Provider>
  );
};

export default Web3;
