import React from "react";
import Link from "next/link";

import Text from "../Text";
import Web3Context from "../Web3Context";
import { hexToString } from "@polkadot/util";
import { NFT as NFTType } from "../../pages/create";
import Image from "next/image";
import TokenSelect from "./Select";
import Input from "../Input";
import { ReactComponent as AlertIcon } from "../../public/error_alert.svg";

interface Props {
  collectionId: number;
  seriesId: number;
  serialNumber: number;
}

type Collection = {
  id: number;
  name: string;
};

const Bid: React.FC<Props> = ({ collectionId, seriesId, serialNumber }) => {
  const web3Context = React.useContext(Web3Context);
  const [defaultCollection, setDefaultCollection] =
    React.useState<Collection>();

  const getCollectionWiseTokens = async (api, address) => {
    return await api.derive.nft.tokensOf(address);
  };

  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [numOfRoyalties, setNumOfRoyalties] = React.useState(1);
  const [error, setError] = React.useState(null);
  const [token, setToken] = React.useState("CENNZ");
  const [isSplitRoyaltyChecked, setIsSplitRoyaltyChecked] =
    React.useState(true);
  const [remainingPercentage, setRemainingPercentage] = React.useState(0);

  React.useEffect(() => {
    (async () => {
      const api = web3Context.api;
      /**
       * Load user collections and check if default Litho collection is already created for the user.
       * If the collection exists use the existing collection id else create a new collection while minting.
       */
      if (web3Context.account) {
        const tokensInCollections = await getCollectionWiseTokens(
          api,
          web3Context.account.address
        );

        let collectionIds = tokensInCollections
          .filter((tokens) => tokens.length > 0)
          .map((tokens) => tokens.toJSON()[0].collectionId);

        const collections: Array<Collection> = await Promise.all(
          collectionIds.map((collectionId) => {
            return new Promise(async (resolve) => {
              const name = await api.query.nft.collectionName(collectionId);
              resolve({ id: collectionId, name: hexToString(name.toString()) });
            });
          })
        );
        const defaultCollection: Collection = collections.find(
          (collection: Collection) => collection.name === "Litho (default)"
        );
        if (defaultCollection) {
          setDefaultCollection(defaultCollection);
        }
      }
    })();
  }, [web3Context.account]);

  const submitHandler: React.FormEventHandler<HTMLFormElement> = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const { file, coverimage, storage } = event.currentTarget;
  };

  const renderRoyaltyInputs = (num) => {
    const Royalties = [];
    for (let i = 0; i < num; i++) {
      Royalties.push(
        <div className="flex w-full items-center justify-between" key={i}>
          <Input
            name={`royalty-account-${i + 1}`}
            placeholder="Example: Size 20px"
            className="flex-1"
            defaultValue={"attribute"}
          />
          <Input
            name={`royalty-percentage-${i + 1}`}
            placeholder="Example: Size 20px"
            className="flex-1"
            defaultValue={"attribute"}
          />
        </div>
      );
    }

    return Royalties;
  };

  return (
    <form className="flex flex-col lg:w-3/5 m-auto" onSubmit={submitHandler}>
      {error && (
        <div className="bg-litho-red bg-opacity-25 text-litho-red font-bold p-2 text-base mb-4">
          {error}
        </div>
      )}

      <label>
        <Text variant="h6">Token</Text>
      </label>
      <TokenSelect
        onChange={(val) => {
          setToken(val);
        }}
      />

      <label>
        <Text variant="h6">Price</Text>
      </label>
      <Input
        name="copies"
        type="number"
        placeholder={`Enter your price in ${"CENNZ"}`}
        min={1}
      />
      <Text variant="caption" className="text-opacity-60 mb-10">
        Service fee 2.5%
      </Text>

      <label>
        <Text variant="h6">Total Royalty in %</Text>
      </label>
      <Input
        name="royalty"
        type="number"
        placeholder="5%"
        className="w-1/2 mb-10"
        min={0}
        max={100}
      />

      <div
        className="flex item-center"
        onClick={() => setShowAdvanced((val) => !val)}
      >
        <Text variant="h5">Distrubution of Royalties</Text>
        <span className="ml-4 top-1">
          <Image
            src="/arrow.svg"
            height="12"
            width="12"
            className={`transform transition-transform ${
              !showAdvanced ? "rotate-180" : "rotate-0"
            }`}
          />
        </span>
      </div>
      <div
        className={`${
          showAdvanced ? "h-auto py-4" : "h-0"
        } flex flex-col overflow-hidden`}
      >
        <div className="w-full flex items-center justify-between mt-10 mb-10">
          <label className="border bg-litho-gray4 flex-1 inline-flex items-center justify-center py-4">
            <input
              type="checkbox"
              className="p-2"
              checked={isSplitRoyaltyChecked}
              onClick={() => setIsSplitRoyaltyChecked((val) => !val)}
            />
            <span className="ml-2">Split royalities evenly</span>
          </label>
          <div className="border bg-litho-gray4 flex-1 ml-6 inline-flex items-center justify-center py-4">
            <AlertIcon />
            <span className="ml-2">{`${remainingPercentage}% of royalties remain`}</span>
          </div>
        </div>
        <label>
          <Text variant="h6">
            Attributes (function as category, theme or descriptive tags to
            organise your NFTs)
          </Text>
        </label>

        {renderRoyaltyInputs(numOfRoyalties)}

        <button
          type="button"
          className={`bg-litho-cream text-center py-2 border border-black w-56 text-base mt-10`}
          onClick={() => setNumOfRoyalties((num) => num + 1)}
        >
          <Text variant="button" color="litho-blue">
            + ADD COLLABORATOR
          </Text>
        </button>
      </div>

      <div className="w-full flex items-center justify-between mt-10">
        <Link
          href={`/nft/${collectionId}/${seriesId}/${serialNumber}`}
          passHref
        >
          <a className="w-full md:w-auto border border-litho-blue bg-litho-cream flex-1 text-center py-2">
            <Text variant="button" color="litho-blue">
              CANCEL
            </Text>
          </a>
        </Link>
        <button className="border bg-litho-blue flex-1 ml-6 text-center py-2">
          <Text variant="button" color="white">
            SELL
          </Text>
        </button>
      </div>
    </form>
  );
};

export default Bid;
