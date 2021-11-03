import React from "react";
import Link from "next/link";

import Text from "../Text";
import Web3Context from "../Web3Context";
import { hexToString } from "@polkadot/util";
import { NFT as NFTType } from "../../pages/create";
import isImageOrVideo from "../../utils/isImageOrVideo";

interface Props {
  moveToPreview: (nftData: any) => void;
  nft: NFTType;
  goBack: () => void;
  setModalState: (modalState: string) => void;
}

type Collection = {
  id: number;
  name: string;
};

const getFileExtensionFromName = (fileName) => {
  const name = fileName
    .replace("https://ipfs.io/")
    .replace("https://gateway.pinata.cloud/ipfs/");
  const lastDotInName = name.lastIndexOf(".");
  const fileExtension = name.substr(lastDotInName + 1);
  return fileExtension;
};

const Upload: React.FC<Props> = ({
  moveToPreview,
  nft,
  goBack,
  setModalState,
}) => {
  const web3Context = React.useContext(Web3Context);
  const [defaultCollection, setDefaultCollection] =
    React.useState<Collection>();
  const [fileName, setFileName] = React.useState<string>();
  const [fileExtension, setFileExtension] = React.useState<string>(
    nft.image ? getFileExtensionFromName(nft.image.name) : undefined
  );
  const [coverImageName, setCoverImageName] = React.useState<string>();
  const [coverFileExtension, setCoverFileExtension] = React.useState<string>(
    nft.coverImage ? getFileExtensionFromName(nft.coverImage) : undefined
  );
  const [error, setError] = React.useState(null);

  const getCollectionWiseTokens = async (api, address) => {
    return await api.derive.nft.tokensOf(address);
  };

  React.useEffect(() => {
    (async () => {
      const api = web3Context.api;
      /**
       * Load user collections and check if default Litho collection is already created for the user.
       * If the collection exists use the existing collection id else create a new collection while minting.
       */
      if (web3Context.selectedAccount) {
        const tokensInCollections = await getCollectionWiseTokens(
          api,
          web3Context.selectedAccount
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
  }, [web3Context.selectedAccount]);

  const submitHandler: React.FormEventHandler<HTMLFormElement> = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const { file, coverimage, storage } = event.currentTarget;

    if (file.files.length === 0 && !nft.image) {
      setError("Please upload an image");
      return;
    }

    moveToPreview({
      image: file.files[0],
      coverImage: coverimage?.files?.length > 0 ? coverimage.files[0] : null,
      storage: storage.value,
      collectionId: defaultCollection ? defaultCollection.id : null,
      fileExtension,
      coverFileExtension,
    });
  };

  const fileSelectorHandler = (event) => {
    const { currentTarget } = event;
    const { files, name } = currentTarget;
    if (!currentTarget || files.length === 0) {
      return;
    }

    const fileSize = files[0].size / 1024 / 1024; // in MB
    if (fileSize > 10) {
      setModalState("fileSizeExceeded");
    } else {
      const fileName = files[0].name;

      const fileExtension = getFileExtensionFromName(fileName);

      if (name === "file") {
        setFileName(fileName);
        setFileExtension(fileExtension);
      } else {
        setCoverImageName(fileName);
        const cfileExtension = getFileExtensionFromName(fileName);
        setCoverFileExtension(cfileExtension);
      }
    }
  };

  return (
    <form
      className="flex flex-col lg:w-3/5 m-auto text-xl"
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
        className="border border-litho-black p-4 text-base bg-white text-opacity-25 text-litho-black cursor-pointer overflow-hidden"
      >
        <Text variant="h6">
          {fileName
            ? fileName
            : nft.image
            ? nft.image.name
            : "Choose from folder"}
        </Text>
      </label>
      <Text
        variant="caption"
        className={`text-opacity-60 mb-10 ${
          fileName || nft.image ? "invisible" : "visible"
        }`}
      >
        We support: bmp, gif, jpeg, png, svg, tiff, webp, mp4, ogv, quicktime,
        webm, glb, mp3, oga, wav, xwav, flac, pdf, html (zip archive), md up to
        10MB
      </Text>
      <input
        name="file"
        type="file"
        className="hidden"
        id="file"
        onChange={fileSelectorHandler}
      />
      {fileExtension && !isImageOrVideo(fileExtension) && (
        <>
          <Text variant="h6">Add cover image (Optional)</Text>
          <label
            htmlFor="coverimage"
            className="border border-litho-black p-4 mb-6 text-base bg-white text-opacity-25 text-litho-black mb-10"
          >
            <Text variant="h6">
              {coverImageName
                ? coverImageName
                : nft.coverImage
                ? nft.coverImage.name
                : "Choose from folder"}
            </Text>
          </label>
          <input
            name="coverimage"
            type="file"
            className="hidden"
            id="coverimage"
            accept=".jpg,.png,.svg,.jpeg,.webp,.gif"
            onChange={fileSelectorHandler}
          />
        </>
      )}
      <label>
        <Text variant="h6">Choose content storage</Text>
      </label>
      <select
        className="border border-litho-black border-opacity-40 p-4 mb-6 text-base bg-white text-opacity-75 text-litho-black mb-10 cursor-not-allowed no-arrow"
        name="storage"
        defaultValue={"ipfs"}
        disabled
      >
        <option value="ipfs">IPFS</option>
      </select>

      <div className="w-full flex items-center justify-between mt-10">
        <button
          className="border border-litho-blue bg-litho-cream flex-1 text-center py-2"
          onClick={goBack}
        >
          <Text variant="button" color="litho-blue">
            BACK
          </Text>
        </button>
        <button className="border bg-litho-blue flex-1 ml-6 text-center py-2">
          <Text variant="button" color="white">
            NEXT: PREVIEW
          </Text>
        </button>
      </div>
    </form>
  );
};

export default Upload;
