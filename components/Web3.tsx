import React, { useEffect } from "react";
import {
  web3Enable,
  web3AccountsSubscribe,
  web3FromSource,
  web3Accounts,
} from "@polkadot/extension-dapp";
import { InjectedExtension } from "@polkadot/extension-inject/types";

import { defaults as addressDefaults } from "@polkadot/util-crypto/address/defaults";
import { Api as ApiPromise } from "@cennznet/api";
import Link from "next/link";
import { hexToString } from "@polkadot/util";
import store from "store";

import Web3Context from "./Web3Context";
import axios from "axios";
const endpoint = process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT;
const EXTENSION = "cennznet-extension";

async function extractMeta(api) {
  const systemChain = await api.rpc.system.chain();
  const genesisHashExpected = api.genesisHash.toString();
  const response = await axios.get(
    "https://raw.githubusercontent.com/cennznet/api.js/master/extension-releases/runtimeModuleTypes.json"
  );
  const { data } = response;
  const additionalTypes = data;
  if (additionalTypes) {
    let typesForCurrentChain = additionalTypes[genesisHashExpected];
    // if not able to find types, take the first element (in case of local node the genesis Hash keep changing)
    typesForCurrentChain =
      typesForCurrentChain === undefined
        ? Object.values(additionalTypes)[0]
        : typesForCurrentChain;
    let specTypes, userExtensions;
    if (typesForCurrentChain) {
      specTypes = typesForCurrentChain.types;
      userExtensions = typesForCurrentChain.userExtensions;
    }
    const DEFAULT_SS58 = api.registry.createType("u32", addressDefaults.prefix);
    const DEFAULT_DECIMALS = api.registry.createType("u32", 4);
    const metadata = {
      chain: systemChain,
      color: "#191a2e",
      genesisHash: api.genesisHash.toHex(),
      icon: "CENNZnet",
      metaCalls: Buffer.from(api.runtimeMetadata.asCallsOnly.toU8a()).toString(
        "base64"
      ),
      specVersion: api.runtimeVersion.specVersion.toNumber(),
      ss58Format: DEFAULT_SS58.toNumber(),
      tokenDecimals: DEFAULT_DECIMALS.toNumber(),
      tokenSymbol: "CENNZ",
      types: specTypes,
      userExtensions: userExtensions,
    };
    return metadata;
  }
  return null;
}

const Web3: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [hasWeb3injected, setHasWeb3Injected] = React.useState(false);
  const [wallet, setWallet] = React.useState<InjectedExtension>();
  const [balances, setBalances] = React.useState(null);
  const [signer, setSigner] = React.useState(null);
  const [accounts, setAccounts] = React.useState([]);
  const [selectedAccount, setSelectedAccount] = React.useState(null);
  const [showNoExtensionMessage, setShowNoExtensionMessage] =
    React.useState(false);
  const [showZeroAccountMessage, setShowZeroAccountMessage] =
    React.useState(false);
  const [isRefresh, setIsRefresh] = React.useState(false);
  const [api, setAPI] = React.useState(null);
  const [cennzUSDPrice, setCennzUSDPrice] = React.useState(null);

  const getAccountAssets = async (address: string) => {
    await api.isReady;
    const assets = await api.rpc.genericAsset.registeredAssets();
    const tokenMap = {};
    assets.forEach((asset) => {
      const [tokenId, { symbol, decimalPlaces }] = asset;
      if (hexToString(symbol.toJSON()) !== "")
        tokenMap[tokenId] = {
          symbol: hexToString(symbol.toJSON()),
          decimalPlaces: decimalPlaces.toNumber(),
        };
    });
    const balanceSubscriptionArg = Object.keys(tokenMap).map(
      (tokenId, index) => {
        tokenMap[tokenId].index = index;
        return [tokenId, address];
      }
    );
    await api.query.genericAsset.freeBalance.multi(
      balanceSubscriptionArg,
      (balances) => {
        const userBalances = {};
        Object.keys(tokenMap).forEach((tokenId) => {
          const token = tokenMap[tokenId];
          if (balances[token.index] / Math.pow(10, token.decimalPlaces) > 0)
            userBalances[token.symbol] = {
              balance:
                balances[token.index] / Math.pow(10, token.decimalPlaces),
              tokenId,
              decimalPlaces: token.decimalPlaces,
            };
        });

        setBalances(userBalances);
      }
    );
  };

  const updateSelectedAccount = async (account) => {
    setSelectedAccount(account);
  };

  const connectWallet = async (callback) => {
    console.log("connect wallet clicked");
    try {
      const extensions = await web3Enable("Litho");
      if (extensions.length === 0) {
        throw new Error("No extension found");
      }
      const cennznetWallet = extensions.find(
        (extension) => extension.name === "cennznet-extension"
      );

      if (!cennznetWallet) throw new Error("CENNZnet wallet not found");
      const metadata = cennznetWallet.metadata;
      const checkIfMetaUpdated = localStorage.getItem(`EXTENSION_META_UPDATED`);
      if (!checkIfMetaUpdated && api) {
        try {
          const metadataDef = await extractMeta(api);
          if (metadataDef) {
            await metadata.provide(metadataDef as any);
            localStorage.setItem(`EXTENSION_META_UPDATED`, "true");
          }
        } catch (e) {
          // any issue with metadata update should not ask to install extension
          console.log(`update metadata rejected ${e}`);
        }
      }

      setWallet(cennznetWallet);
      store.set("CENNZNET-EXTENSION", cennznetWallet);

      setHasWeb3Injected(true);

      if (callback) {
        callback();
      }
    } catch (error) {
      setShowNoExtensionMessage(true);
      setHasWeb3Injected(false);
    }
  };

  // Create api instance on endpoint change
  useEffect(() => {
    let apiInstance;
    try {
      apiInstance = new ApiPromise({ provider: endpoint });
    } catch (err) {
      console.error(`cennznet connection failed: ${err}`);
    }

    if (!apiInstance) {
      console.warn(`cennznet is not connected. endpoint: ${endpoint}`);
      return;
    }

    apiInstance.isReady.then(() => setAPI(apiInstance));
  }, [endpoint]);

  // Get balances for extension account when api or web3Account has changed
  useEffect(() => {
    if (api && selectedAccount) {
      getAccountAssets(selectedAccount);
    }
  }, [api, selectedAccount]);

  // Set account/signer when wallet has changed
  useEffect(() => {
    const getSelectedAccount = async () => {
      await web3Enable("Litho");
      const accounts = await web3Accounts();

      if (accounts.length === 0) {
        setSelectedAccount(null);
        setShowZeroAccountMessage(true);
      } else {
        const acc = accounts.map((acc) => ({
          address: acc.address,
          name: acc.meta.name,
        }));
        setAccounts(acc);
      }

      web3AccountsSubscribe(async (accounts) => {
        if (accounts.length) {
          const acc = accounts.map((acc) => ({
            address: acc.address,
            name: acc.meta.name,
          }));
          setAccounts(acc);
        }
      });
    };

    // if wallet exist,
    if (wallet) {
      getSelectedAccount();
    }
  }, [wallet]);

  useEffect(() => {
    (async () => {
      await web3Enable("Litho");
      if (signer === null || signer === undefined) {
        const injector = await web3FromSource(EXTENSION);
        setSigner(injector.signer);
      }
      if (
        (selectedAccount === undefined || selectedAccount === null) &&
        accounts.length > 0
      ) {
        //  select the 0th account by default if no accounts are selected
        setSelectedAccount(accounts[0].address);
      }
    })();
  }, [accounts]);

  // on mount if wallet is not set, check store and load the wallet
  useEffect(() => {
    if (!wallet) {
      setWallet(store.get("CENNZNET-EXTENSION"));
      if (cennzUSDPrice === null) {
        try {
          const coinGeckoUrl =
            "https://api.coingecko.com/api/v3/simple/price?ids=centrality&vs_currencies=usd";
          axios.get(coinGeckoUrl).then(function (response) {
            const { data } = response;
            const price = data.centrality.usd;
            setCennzUSDPrice(price);
          });
        } catch (e) {
          console.log("Error setting conversion rate");
        }
      }
    }
  });

  return (
    <Web3Context.Provider
      value={{
        hasWeb3injected,
        connectWallet,
        updateSelectedAccount,
        extension: wallet,
        balances,
        signer,
        accounts,
        selectedAccount,
        api,
        cennzUSDPrice,
      }}
    >
      {children}

      {showNoExtensionMessage && (
        <div
          style={{ zIndex: 1000 }}
          className="fixed top-0 left-0 h-full w-full bg-litho-cream bg-opacity-75 flex items-center justify-center"
        >
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
                CANCEL
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
                  {isRefresh ? "REFRESH" : "INSTALL"}
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
              Your wallet currently has zero accounts
            </span>
            <div className="self-end flex items-center mt-8">
              <button
                className="ml-4 rounded-sm text-sm text-white bg-litho-blue px-2 py-1"
                onClick={() => setShowZeroAccountMessage(false)}
              >
                OKAY
              </button>
            </div>
          </div>
        </div>
      )}
    </Web3Context.Provider>
  );
};

export default Web3;
