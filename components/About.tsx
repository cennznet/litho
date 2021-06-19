import React, { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import Input from "./Input";

const MAX_ATTRIBUTES = 16;

const About: React.FC<{ moveToUploadAsset: (formData: any) => void }> = ({
  moveToUploadAsset,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [numOfAttributes, setNumOfAttributes] = React.useState(1);
  const [error, setError] = React.useState(null);

  const renderAttributeInputs = (num) => {
    const attributeContainers = [];
    for (let i = 0; i < num; i++) {
      attributeContainers.push(
        <div className="flex w-full items-center" key={i}>
          <Input
            name={`attribute-key-${i + 1}`}
            placeholder="Key (Example: size)"
            className="flex-1"
          />
          <Input
            name={`attribute-value-${i + 1}`}
            placeholder="Value (Example: 200x200)"
            className="flex-1 ml-4"
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
    const { title, description, copies } = event.currentTarget;

    const titleValue = (title as any).value;
    const descriptionValue = description.value;
    const numOfCopies = copies.value;

    if (!titleValue) {
      setError("Please provide a name for the NFT");
      return;
    }

    const attributes = [];
    for (let i = 0; i < numOfAttributes; i++) {
      const key = event.target[`attribute-key-${i + 1}`];
      const value = event.target[`attribute-value-${i + 1}`];
      if (key.value) {
        if (!value.value) {
          setError("All attributes should have a value");
          return;
        }
        attributes.push({
          [key.value]: value.value,
        });
      }
    }

    console.log({
      title: titleValue,
      description: descriptionValue,
      copies: numOfCopies,
      attributes,
    });

    moveToUploadAsset({
      title: titleValue,
      description: descriptionValue,
      copies: numOfCopies,
      attributes,
    });
  };

  return (
    <form
      className="flex flex-col w-3/5 m-auto text-xl"
      onSubmit={submitAboutNFT}
      onFocus={() => setError(null)}
    >
      {error && (
        <div className="bg-litho-red bg-opacity-25 text-litho-red font-bold p-2 text-base mb-4">
          {error}
        </div>
      )}
      <label>Title</label>
      <Input name="title" placeholder="Sheep NFT" />

      <label>Description</label>
      <textarea
        name="description"
        placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud."
        className="border border-litho-black p-4 mb-8 text-base"
        rows={5}
      />

      <label>Number of copies</label>
      <Input name="copies" type="number" placeholder="0" className="mb-10" />

      <div
        className="font-bold text-2xl flex item-center "
        onClick={() => setShowAdvanced((val) => !val)}
      >
        Advanced
        <span className="ml-4">
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
        <label>Attributes (Optional)</label>

        {renderAttributeInputs(numOfAttributes)}

        <button
          type="button"
          className="bg-litho-cream text-litho-blue text-center py-2 border border-black w-56 text-base"
          onClick={() => setNumOfAttributes((num) => num + 1)}
        >
          + Add Attributes (15 left)
        </button>
      </div>

      <div className="w-full flex items-center justify-between mt-10">
        <Link href="/">
          <a className="border bg-litho-cream text-base text-litho-blue flex-1 text-center py-2">
            Cancel
          </a>
        </Link>
        <button className="border bg-litho-blue text-base text-white flex-1 ml-6 text-center py-2">
          Next: Upload Assets
        </button>
      </div>
    </form>
  );
};

export default About;
