import React from "react";
import Link from "next/link";

import Text from "../Text";
import Web3Context from "../Web3Context";
import Input from "./Input";

interface Props {
  moveToPreview: (nftData: any) => void;
}

const Upload: React.FC<Props> = ({ moveToPreview }) => {
  const web3Context = React.useContext(Web3Context);
  const [userCollections, setCollections] = React.useState([]);
  const [showNewCollectionFields, setShowNewCollectionFields] =
    React.useState(false);

  React.useEffect(() => {
    (async () => {
      const api = web3Context.api;
      if (web3Context.account) {
        const allTokens = await api.derive.nft.tokensOf(
          web3Context.account.address
        );
        if (allTokens) {
          setCollections([]);
        }
      }
    })();
  }, [web3Context.account]);

  const submitHandler: React.FormEventHandler<HTMLFormElement> = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const { file, storage, collection, collectionId } = event.currentTarget;

    moveToPreview({
      image: file.files[0],
      storage: storage.value,
      createNew: showNewCollectionFields,
      collectionName: collection
        ? collection.value
        : `${web3Context.account.meta.name} collection`,
      collectionId: collectionId && collectionId.value,
    });
  };

  return (
    <form
      className="flex flex-col w-3/5 m-auto text-xl"
      onSubmit={submitHandler}
    >
      <Text variant="h6">Upload Assets</Text>
      <label
        htmlFor="file"
        className="border border-litho-black p-4 mb-6 text-base bg-white text-opacity-25 text-litho-black mb-10"
      >
        <Text variant="body1">Choose from folder</Text>
      </label>
      <input name="file" type="file" className="hidden" id="file" />
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
