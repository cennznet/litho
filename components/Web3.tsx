import React, { useEffect } from "react";
import {
  web3Enable,
  web3AccountsSubscribe,
  web3FromSource,
  web3Accounts,
} from "@polkadot/extension-dapp";
import { InjectedExtension } from "@polkadot/extension-inject/types";

import { getSpecTypes } from "@polkadot/types-known";
import { defaults as addressDefaults } from "@polkadot/util-crypto/address/defaults";
import { Api as ApiPromise } from "@cennznet/api";
import Link from "next/link";
import { hexToString } from "@polkadot/util";
import store from "store";

import Web3Context from "./Web3Context";

import { cennznetExtensions } from "../utils/cennznetExtensions";

const endpoint = process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT;

async function extractMeta(api) {
  const systemChain = await api.rpc.system.chain();
  const specTypes = getSpecTypes(
    api.registry,
    systemChain,
    api.runtimeVersion.specName,
    api.runtimeVersion.specVersion
  );
  const filteredSpecTypes = Object.keys(specTypes)
    .filter((key) => typeof specTypes[key] !== "function")
    .reduce((obj, key) => {
      obj[key] = specTypes[key];
      return obj;
    }, {});
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
    types: filteredSpecTypes,
    userExtensions: cennznetExtensions,
  };
  return metadata;
}

const Web3: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [hasWeb3injected, setHasWeb3Injected] = React.useState(false);
  const [wallet, setWallet] = React.useState<InjectedExtension>();
  const [web3Account, setWeb3Account] = React.useState(null);
  const [account, setAccount] = React.useState(null);
  const [showNoExtensionMessage, setShowNoExtensionMessage] =
    React.useState(false);
  const [showZeroAccountMessage, setShowZeroAccountMessage] =
    React.useState(false);
  const [isRefresh, setIsRefresh] = React.useState(false);
  const [api, setAPI] = React.useState(null);

  const getAccountAssets = async (address: string) => {
    await api.isReady;
    const assets = await api.rpc.genericAsset.registeredAssets();
    const tokenMap = {};
    assets.forEach((asset) => {
      const [tokenId, { symbol, decimalPlaces }] = asset;
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
          userBalances[token.symbol] = {
            balance: balances[token.index] / Math.pow(10, token.decimalPlaces),
            tokenId,
            decimalPlaces: token.decimalPlaces,
          };
        });
        setAccount((account) => ({
          ...account,
          balances: userBalances,
        }));
      }
    );
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
        const metadataDef = await extractMeta(api);
        await metadata.provide(metadataDef as any);
        localStorage.setItem(`EXTENSION_META_UPDATED`, "true");
      }

      setWallet(cennznetWallet);
      store.set("WALLET", cennznetWallet);

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
    const apiInstance = new ApiPromise({ provider: endpoint });

    if (!apiInstance.isReady) return;
    setAPI(apiInstance);
  }, [endpoint]);

  // Get balances for extension account when api or web3Account has changed
  useEffect(() => {
    if (api && web3Account) {
      getAccountAssets(web3Account.address);
    }
  }, [api, web3Account]);

  // Set account/signer when wallet has changed
  useEffect(() => {
    const getSelectedAccount = async () => {
      await web3Enable("Litho");
      const accounts = await web3Accounts();

      if (accounts.length === 0) {
        setWeb3Account(null);
        setShowZeroAccountMessage(true);
        throw new Error("No accounts found in CENNZnet wallet");
      }
      setWeb3Account(accounts[0]);

      const injector = await web3FromSource(accounts[0].meta.source);
      const payload = { signer: injector.signer };
      const signer = accounts[0].address;
      setAccount({ ...accounts[0], payload, signer });
      setShowZeroAccountMessage(false);

      web3AccountsSubscribe(async (accounts) => {
        if (accounts.length) {
          setWeb3Account(accounts[0]);
        }
      });
    };

    // if wallet exist,
    if (wallet) {
      getSelectedAccount();
    }
  }, [wallet]);

  // on mount if wallet is not set, check store and load the wallet
  useEffect(() => {
    if (!wallet) {
      setWallet(store.get("WALLET"));
    }
  });

  return (
    <Web3Context.Provider
      value={{
        hasWeb3injected,
        connectWallet,
        extension: wallet,
        account,
        api,
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
