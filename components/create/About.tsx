import React from "react";
import Image from "next/image";
import Link from "next/link";

import Input from "./Input";
import Text from "../Text";
import Web3Context from "../Web3Context";
import { NFT as NFTType } from "../../pages/create";

const MAX_ATTRIBUTES = 16;

const About: React.FC<{
  moveToUploadAsset: (formData: any) => void;
  nft: NFTType;
}> = ({ moveToUploadAsset, nft }) => {
  const [showAdvanced, setShowAdvanced] = React.useState(
    nft.royalty > 0 || nft.attributes.length > 0
  );
  const [numOfAttributes, setNumOfAttributes] = React.useState(
    nft.attributes.length || 1
  );
  const [error, setError] = React.useState(null);
  const web3Context = React.useContext(Web3Context);

  const renderAttributeInputs = (num) => {
    const attributeContainers = [];
    for (let i = 0; i < num; i++) {
      let attributeKey, attributeValue;
      if (nft.attributes[i]) {
        if (nft.attributes[i].Text) {
          let attri = nft.attributes[i].Text;
          attri = JSON.parse(attri);
          attributeKey = Object.keys(attri) ? Object.keys(attri)[0] : "";
          attributeValue = Object.values(attri) ? Object.values(attri)[0] : "";
        }
      }
      attributeContainers.push(
        <div className="flex w-full items-center" key={i}>
          <Input
            name={`key-attribute-${i + 1}`}
            placeholder="Key (Size)"
            className="flex-2 mr-3"
            defaultValue={attributeKey}
          />
          <Input
            name={`value-attribute-${i + 1}`}
            placeholder="Value: (20px)"
            className="flex-1"
            defaultValue={attributeValue}
          />
        </div>
      );
    }

    return attributeContainers;
  };

  const submitAboutNFT: React.FormEventHandler<HTMLFormElement> = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const { title, description, copies, royalty } = event.currentTarget;

    const titleValue = (title as any).value;
    const descriptionValue = description.value;
    const numOfCopies = copies.value || 1;
    const royaltyForNFT = royalty.value;

    if (!titleValue) {
      setError("Please provide a name for the NFT");
      return;
    }

    if (!descriptionValue) {
      setError("Please provide a description for the NFT");
      return;
    }

    const attributes = [];
    for (let i = 0; i < numOfAttributes; i++) {
      const attributeInputKey = event.target[`key-attribute-${i + 1}`];
      const attributeInputVal = event.target[`value-attribute-${i + 1}`];
      if (
        attributeInputKey &&
        attributeInputKey.value &&
        attributeInputVal &&
        attributeInputVal.value
      ) {
        const attrObj = {};
        attrObj[attributeInputKey.value] = attributeInputVal.value;
        attributes.push({
          Text: JSON.stringify(attrObj),
        });
      }
    }

    if (!web3Context.selectedAccount) {
      web3Context.connectWallet(() => {
        moveToUploadAsset({
          title: titleValue,
          description: descriptionValue,
          copies: numOfCopies,
          attributes,
          royalty: royaltyForNFT,
        });
      });
    } else {
      moveToUploadAsset({
        title: titleValue,
        description: descriptionValue,
        copies: numOfCopies,
        attributes,
        royalty: royaltyForNFT,
      });
    }
  };

  return (
    <form
      className="flex flex-col lg:w-3/5 m-auto"
      onSubmit={submitAboutNFT}
      onFocus={() => setError(null)}
    >
      {error && (
        <div className="bg-litho-red bg-opacity-25 text-litho-red font-bold p-2 text-base mb-4">
          {error}
        </div>
      )}
      <label>
        <Text variant="h6">Title</Text>
      </label>
      <Input
        name="title"
        id="title"
        defaultValue={nft.title}
        placeholder="Enter a name for your NFT"
        maxLength={140}
      />

      <label>
        <Text variant="h6">Description</Text>
      </label>
      <textarea
        name="description"
        placeholder="Enter a short description of your NFT to accompany your marketplace listing"
        className="border border-litho-black p-4 mb-8 text-base"
        rows={5}
        defaultValue={nft.description}
        maxLength={500}
      />

      <label>
        <Text variant="h6">Number of copies</Text>
      </label>
      <Input
        name="copies"
        type="number"
        placeholder="1"
        className="mb-10"
        min={1}
        defaultValue={nft.copies}
      />
      <label>
        <Text variant="h6">Royalty in %</Text>
      </label>
      <Input
        name="royalty"
        type="number"
        placeholder="5%"
        className="mb-10"
        defaultValue={nft.royalty}
        min={0}
        max={100}
      />

      <div
        className="flex item-center"
        onClick={() => setShowAdvanced((val) => !val)}
      >
        <Text variant="h5">Advanced (Optional)</Text>
        <span className="ml-4 relative top-1">
          <Image
            src="/arrow.svg"
            height="10"
            width="10"
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
        <label>
          <Text variant="h6">
            Attributes (function as category, theme or descriptive tags to
            organise your NFTs)
          </Text>
        </label>

        {renderAttributeInputs(numOfAttributes)}

        <button
          type="button"
          className={`bg-litho-cream text-center py-2 border border-black w-56 text-base ${
            numOfAttributes === MAX_ATTRIBUTES
              ? "border-gray-500 cursor-not-allowed"
              : ""
          }`}
          onClick={() =>
            numOfAttributes < MAX_ATTRIBUTES &&
            setNumOfAttributes((num) => num + 1)
          }
          disabled={numOfAttributes === MAX_ATTRIBUTES}
        >
          <Text
            variant="button"
            color={
              numOfAttributes === MAX_ATTRIBUTES ? "gray-500" : "litho-blue"
            }
            className={numOfAttributes === MAX_ATTRIBUTES ? "text" : ""}
          >
            + ADD ATTRIBUTE
          </Text>
        </button>
        <Text variant="caption" className="text-opacity-60">
          You can add a maximum of 16 attributes
        </Text>
      </div>

      <div className="w-full flex-col md:flex-row flex items-center justify-between mt-10">
        <Link href="/">
          <a className="w-full md:w-auto border border-litho-blue bg-litho-cream flex-1 text-center py-2">
            <Text variant="button" color="litho-blue">
              CANCEL
            </Text>
          </a>
        </Link>
        <button className="w-full md:w-auto border bg-litho-blue flex-1 mt-4 md:mt-0 md:ml-6 text-center py-2">
          <Text variant="button" color="white">
            {!web3Context.selectedAccount
              ? "CONNECT WALLET TO CONTINUE"
              : "NEXT: UPLOAD ASSETS"}
          </Text>
        </button>
      </div>
    </form>
  );
};

export default About;
