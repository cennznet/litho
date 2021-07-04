import React from "react";
import Link from "next/link";

import Text from "../Text";
import Web3Context from "../Web3Context";
import Input from "./Input";
import { hexToString } from "@polkadot/util";

interface Props {
  moveToPreview: (nftData: any) => void;
}

const Upload: React.FC<Props> = ({ moveToPreview }) => {
  const web3Context = React.useContext(Web3Context);
  const [userCollections, setCollections] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [showNewCollectionFields, setShowNewCollectionFields] =
    React.useState(false);

  const getCollectionWiseTokens = async (api, address) => {
    return await api.derive.nft.tokensOf(address);
  };

  React.useEffect(() => {
    (async () => {
      const api = web3Context.api;
      if (web3Context.account) {
        const tokensInCollections = await getCollectionWiseTokens(
          api,
          web3Context.account.address
        );
        let collectionIds = tokensInCollections
          .filter((tokens) => tokens.length > 0)
          .map((tokens) => tokens[0].collectionId.toJSON());

        const collections = await Promise.all(
          collectionIds.map((collectionId) => {
            return new Promise(async (resolve) => {
              const name = await api.query.nft.collectionName(collectionId);
              resolve({ id: collectionId, name: hexToString(name.toString()) });
            });
          })
        );
        setCollections(collections);
      }
    })();
  }, [web3Context.account]);

  const submitHandler: React.FormEventHandler<HTMLFormElement> = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const { file, storage, collection, collectionId } = event.currentTarget;

    if (file.files.length === 0) {
      setError("Please upload an image");
      return;
    }

    moveToPreview({
      image: file.files[0],
      storage: storage.value,
      createNew: showNewCollectionFields,
      collectionName:
        collection && collection.value
          ? collection.value
          : collectionId && collectionId.value
          ? null
          : `${web3Context.account.meta.name} collection`,
      collectionId: collectionId && collectionId.value,
    });
  };

  return (
    <form
      className="flex flex-col w-3/5 m-auto text-xl"
      onSubmit={submitHandler}
    >
      {error && (
        <div className="bg-litho-red bg-opacity-25 text-litho-red font-bold p-2 text-base mb-4">
          {error}
        </div>
      )}
      <Text variant="h6">Upload Assets</Text>
      <label
        htmlFor="file"
        className="border border-litho-black p-4 mb-6 text-base bg-white text-opacity-25 text-litho-black mb-10"
      >
        <Text variant="body1">Choose from folder</Text>
      </label>
      <input
        name="file"
        type="file"
        className="hidden"
        id="file"
        accept=".jpg,.png,.svg,.jpeg,.webp"
      />
      <label>
        <Text variant="h6">Choose content storage</Text>
      </label>
      <select
        className="border border-litho-black p-4 mb-6 text-base bg-white text-opacity-75 text-litho-black mb-10 cursor-not-allowed"
        name="storage"
        defaultValue={"ipfs"}
      >
        <option value="ipfs">IPFS</option>
      </select>
      {userCollections.length > 0 && (
        <>
          <label>
            <Text variant="h6">Collection</Text>
          </label>
          <select
            className="border border-litho-black p-4 mb-6 text-base bg-white text-opacity-75 text-litho-black mb-10 cursor-not-allowed"
            onChange={(event) => {
              if (event.target.value === "new") {
                setShowNewCollectionFields(true);
              } else {
                setShowNewCollectionFields(false);
              }
            }}
          >
            <option defaultChecked value="existing">
              Select existing
            </option>
            <option value="new">Create a new collection</option>
          </select>
        </>
      )}
      {(userCollections.length === 0 || showNewCollectionFields) && (
        <>
          <label id="collection">
            <Text variant="h6">Collection name</Text>
          </label>
          <Input
            name="collection"
            type="text"
            id="collection"
            placeholder={`${
              web3Context.account ? web3Context.account.meta.name : ""
            } collection`}
          />
        </>
      )}
      {userCollections.length && !showNewCollectionFields && (
        <>
          <label id="collectionId">
            <Text variant="h6">Choose Collection</Text>
          </label>
          <select
            className="border border-litho-black p-4 mb-6 text-base bg-white text-opacity-75 text-litho-black mb-10 cursor-not-allowed"
            name="collectionId"
            id="collectionId"
          >
            {userCollections.map((collection) => {
              return <option value={collection.id}>{collection.name}</option>;
            })}
          </select>
        </>
      )}

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
            Next: Preview
          </Text>
        </button>
      </div>
    </form>
  );
};

export default Upload;
