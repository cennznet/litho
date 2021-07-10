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
    nft.royalty || nft.attributes.length > 0
  );
  const [numOfAttributes, setNumOfAttributes] = React.useState(
    nft.attributes.length || 1
  );
  const [error, setError] = React.useState(null);
  const web3Context = React.useContext(Web3Context);

  const renderAttributeInputs = (num) => {
    const attributeContainers = [];
    for (let i = 0; i < num; i++) {
      let attribute;
      if (nft.attributes[i]) {
        attribute = nft.attributes[i].hasOwnProperty("Text")
          ? nft.attributes[i].Text
          : nft.attributes[i].hasOwnProperty("URL")
          ? nft.attributes[i].URL
          : null;
      }
      attributeContainers.push(
        <div className="flex w-full items-center" key={i}>
          <Input
            name={`attribute-${i + 1}`}
            placeholder="Example: Size 20px"
            className="flex-1"
            defaultValue={attribute}
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

    const attributes = [];
    for (let i = 0; i < numOfAttributes; i++) {
      const attributeInput = event.target[`attribute-${i + 1}`];
      if (attributeInput && attributeInput.value) {
        attributes.push({
          Text: attributeInput.value,
        });
      }
    }

    if (!web3Context.account) {
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
      className="flex flex-col w-3/5 m-auto"
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
        placeholder="Sheep NFT"
      />

      <label>
        <Text variant="h6">Description</Text>
      </label>
      <textarea
        name="description"
        placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud."
        className="border border-litho-black p-4 mb-8 text-base"
        rows={5}
        defaultValue={nft.description}
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

      <div
        className="flex item-center"
        onClick={() => setShowAdvanced((val) => !val)}
      >
        <Text variant="h5">Advanced</Text>
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
          <Text variant="h6">Royalty in % (Optional)</Text>
        </label>
        <Input
          name="royalty"
          type="number"
          placeholder="5%"
          className="mb-10"
          defaultValue={nft.royalty}
          min={0}
        />
        <label>
          <Text variant="h6">Attributes (Optional)</Text>
        </label>

        {renderAttributeInputs(numOfAttributes)}

        <button
          type="button"
          className="bg-litho-cream text-center py-2 border border-black w-56 text-base"
          onClick={() =>
            numOfAttributes < MAX_ATTRIBUTES &&
            setNumOfAttributes((num) => num + 1)
          }
        >
          <Text variant="button" color="litho-blue">
            + Add Attributes
          </Text>
        </button>
        <Text variant="caption" className="text-opacity-60">
          You can add maximum 16 attributes
        </Text>
      </div>

      <div className="w-full flex items-center justify-between mt-10">
        <Link href="/">
          <a className="border bg-litho-cream flex-1 text-center py-2">
            <Text variant="button" color="litho-blue">
              Cancel
            </Text>
          </a>
        </Link>
        <button className="border bg-litho-blue flex-1 ml-6 text-center py-2">
          <Text variant="button" color="white">
            {!web3Context.account
              ? "Connect Wallet To Continue"
              : "Next: Upload Assets"}
          </Text>
        </button>
      </div>
    </form>
  );
};

export default About;
