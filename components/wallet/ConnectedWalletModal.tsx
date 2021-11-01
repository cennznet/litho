import React from "react";
import Link from "next/link";

import Modal from "../Modal";
import Text from "../Text";
import Web3Context from "../Web3Context";
import copyTextToClipboard from "../../utils/copyTextToClipboard";

interface Props {
  closeModal: () => void;
  setShowToast: (val: boolean) => void;
}

const ConnectedWalletModal: React.FC<Props> = ({
  closeModal,
  setShowToast,
}) => {
  const web3Context = React.useContext(Web3Context);
  const showAddress = `${web3Context.selectedAccount.substr(
    0,
    8
  )}...${web3Context.selectedAccount.substr(-8)}`;

  // web3Context.accounts
  const tokenLogoURLs = {
    CENNZ: "/cennznet-logo.svg",
    CPAY: "/cpay-logo.svg",
    cUSD: "/cusd-logo.svg",
  };

  return (
    <Modal
      onClose={closeModal}
      styles={{
        modalBody: "w-3/12 absolute top-20 right-20",
        modalContainer: "z-30",
      }}
      hideClose
    >
      <select
        style={{
          width: "90%",
          border: "1px solid #856060",
          borderRadius: "0.25em",
          padding: "0.25em",
          cursor: "pointer",
        }}
        value={web3Context.selectedAccount}
        onChange={(e) => {
          web3Context.updateSelectedAccount(e.target.value);
        }}
        className="mt-4 tailwind font-bold text-2xl text-litho-blue "
      >
        {web3Context.accounts.map((account) => {
          return (
            <option key={account.address} value={account.address}>
              {account.name}
            </option>
          );
        })}
      </select>
      <Text
        variant="body2"
        className="mt-4"
        onClick={() => {
          copyTextToClipboard(web3Context.selectedAccount);
          setShowToast(true);
        }}
      >
        Address: {showAddress}
      </Text>

      <div className="h-0.5 w-full my-6 bg-litho-black bg-opacity-10" />
      <Text variant="subtitle1">Balance</Text>
      {web3Context.balances
        ? Object.keys(web3Context.balances).map((symbol) => {
            return (
              <div className="mt-4 mb-6" key={symbol}>
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gray-200 mr-4 flex items-center justify-center">
                    <img
                      src={tokenLogoURLs[symbol] || "/cennznet-logo.svg"}
                      alt="CENNZ balance"
                      className="h-6 w-6 object-contain"
                    />
                  </div>
                  <Text variant="subtitle1">
                    {web3Context.balances[symbol].balance}
                  </Text>
                  &nbsp;
                  <Text variant="body1">{symbol}</Text>
                </div>
              </div>
            );
          })
        : ""}
      <Link href="https://www.mexc.com">
        <a
          className="flex items-center justify-center bg-litho-blue w-full py-3 h-12"
          target="_blank"
        >
          <Text variant="button" color="white">
            Top up
          </Text>
        </a>
      </Link>
      {/* <div className="flex items-center mt-4">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mr-1"
        >
          <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="#191B1D" />
          <path
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
            fill="#191B1D"
          />
        </svg>

        <span
          className="font-semibold text-base"
          style={{ lineHeight: "18px", letterSpacing: "0.01em" }}
        >
          How does it work?
        </span>
      </div> */}
      <div className="h-0.5 w-full my-8 bg-litho-black bg-opacity-10" />
      <Link href="/me">
        <a onClick={closeModal}>
          <Text variant="button" color="litho-blue">
            My Profile
          </Text>
        </a>
      </Link>
      <br />
      {/* <button
        onClick={() => {
          web3Context.extension.provider.disconnect();
          closeModal();
        }}
        className="mt-6"
      >
        <Text variant="button" color="litho-blue">
          Disconnect
        </Text>
      </button> */}
    </Modal>
  );
};

export default ConnectedWalletModal;
