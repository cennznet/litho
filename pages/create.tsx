import React, { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import Text from "../components/Text";
import Modal from "../components/Modal";
import About from "../components/create/About";
import Upload from "../components/create/Upload";
import Preview from "../components/create/Preview";
import Web3Context from "../components/Web3Context";
import store from "store";
import { hexToString } from "@polkadot/util";

const LITHO_COLLECTION_NAME = "Litho (default)";

export type NFT = {
  title: string;
  description: string;
  copies: number;
  collectionName?: string;
  collectionId?: number;
  image: any;
  coverImage?: any;
  storage?: string;
  attributes: Array<{ [index: string]: string }>;
  royalty: number;
  extension: string;
  coverFileExtension?: string;
};

interface Action {
  type: string;
  payload: any;
}

interface State {
  nft: NFT;
  isAboutFilled: boolean;
  isUploadFilled: boolean;
  currentTab: number;
}

const initialState: State = {
  nft: {
    title: "",
    description: "",
    copies: 1,
    image: null,
    storage: "ipfs",
    attributes: [],
    royalty: 0,
    collectionName: LITHO_COLLECTION_NAME,
    extension: "",
  },
  isAboutFilled: false,
  isUploadFilled: false,
  currentTab: 1,
};

const mintNFTAndCollection = async (
  api,
  account,
  tokenArgs,
  collectionExtrinsic,
  setTransactionInProgress
) => {
  const { collectionId, owner, attributes, metadataPath, royaltiesSchedule } =
    tokenArgs;
  const mintUniqueExtrinsic = api.tx.nft.mintUnique(
    collectionId,
    owner,
    attributes,
    metadataPath,
    royaltiesSchedule
  );
  const batchMinting = collectionExtrinsic
    ? await api.tx.utility.batch([collectionExtrinsic, mintUniqueExtrinsic])
    : await mintUniqueExtrinsic;

  let signer = account.signer;
  let payload = account.payload;
  return new Promise((resolve, reject) => {
    batchMinting
      .signAndSend(signer, payload, ({ status }) => {
        setTransactionInProgress();
        if (status.isInBlock) {
          resolve(status.asInBlock.toString());
          console.log(
            `Completed at block hash #${status.asInBlock.toString()}`
          );
        }
      })
      .catch((error) => {
        console.log(":( transaction failed", error);
        reject(error);
      });
  });
};

const mintNFTSeriesAndCollection = async (
  api,
  account,
  tokenArgs,
  collectionExtrinsic,
  setTransactionInProgress
) => {
  const {
    collectionId,
    quantity,
    owner,
    attributes,
    metadataPath,
    royaltiesSchedule,
  } = tokenArgs;
  console.log(attributes, royaltiesSchedule);
  const mintSeriesExtrinsic = api.tx.nft.mintSeries(
    collectionId,
    quantity,
    owner,
    attributes,
    metadataPath,
    royaltiesSchedule
  );
  const batchMinting = collectionExtrinsic
    ? await api.tx.utility.batch([collectionExtrinsic, mintSeriesExtrinsic])
    : await mintSeriesExtrinsic;

  let signer = account.signer;
  let payload = account.payload;
  return new Promise((resolve, reject) => {
    batchMinting
      .signAndSend(signer, payload, ({ status }) => {
        setTransactionInProgress();
        if (status.isInBlock) {
          resolve(status.asInBlock.toString());
          console.log(
            `Completed at block hash #${status.asInBlock.toString()}`
          );
        }
      })
      .catch((error) => {
        console.log(":( transaction failed", error);
        reject(error);
      });
  });
};

const createReducer: React.Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case "GO_TO_TAB":
      return {
        ...state,
        currentTab: action.payload.currentTab,
      };
    case "MOVE_TO_UPLOAD":
      const { title, description, copies, attributes, royalty } =
        action.payload;
      return {
        ...state,
        nft: {
          ...state.nft,
          title,
          description,
          copies,
          attributes,
          royalty,
        },
        currentTab: 2,
        isAboutFilled: true,
      };
    case "MOVE_TO_PREVIEW":
      const {
        image,
        coverImage,
        storage,
        collectionId,
        extension,
        coverFileExtension,
      } = action.payload;
      return {
        ...state,
        nft: {
          ...state.nft,
          image,
          coverImage,
          storage,
          collectionId,
          extension,
          coverFileExtension,
        },
        currentTab: 3,
        isUploadFilled: true,
      };
    default:
      return state;
  }
};

const Create: React.FC<{}> = () => {
  const router = useRouter();
  const web3Context = React.useContext(Web3Context);
  const [state, dispatch] = React.useReducer<React.Reducer<State, Action>>(
    createReducer,
    initialState
  );
  const [modalState, setModalState] = React.useState<string>();
  const [transactionFee, setTransactionFee] = React.useState<number>();
  const [collectionId, setCollectionId] = React.useState<string | null>(null);

  // Check all collection
  useMemo(() => {
    if (!web3Context.api) return;
    if (collectionId === null) {
      const collectionIdFromStore = store.get("collectionId");
      if (collectionIdFromStore) {
        setCollectionId(collectionIdFromStore);
      } else {
        web3Context.api.query.nft.collectionOwner.entries().then((entries) => {
          if (web3Context.account) {
            const collectionIdsFetched = entries
              .filter(
                (detail) => detail[1].toString() === web3Context.account.address
              )
              .flatMap((detail) => detail[0].toHuman());
            web3Context.api.query.nft.collectionName
              .multi(collectionIdsFetched)
              .then((names) => {
                if (names.length > 0) {
                  const index = names.findIndex(
                    (n) => hexToString(n.toHex()) === LITHO_COLLECTION_NAME
                  );
                  const collectionIdAtIndex = collectionIdsFetched[index];
                  store.set("collectionId", collectionIdAtIndex);
                  setCollectionId(collectionIdAtIndex);
                }
              });
          }
        });
      }
    }
  }, [web3Context.api, web3Context.account]);

  const modalStates = {
    mint: {
      message: "UPLOADING ASSETS TO IPFS",
      subText: "Please wait while the assets are uploaded",
      onClose: () => setModalState(null),
    },
    signTransaction: {
      message: "SIGN THIS TRANSACTION IN YOUR WALLET",
      subText:
        "Confirm the transaction in your wallet to continue, doing this will sign your wallet as the original creator of the NFT",
      onClose: () => setModalState(null),
    },
    txInProgress: {
      message: "PLEASE STAY ON THIS PAGE",
      subText:
        "Your asset is being minted as an NFT on CENNZnet. Please stay on the page until it has been successfully minted.",
      onClose: () => setModalState(null),
    },
    success: {
      message: "CONGRATULATIONS!",
      subText:
        "Your NFT was successfully minted and should be displayed in your wallet shortly.",
      buttons: [
        {
          text: "VIEW MY NFT",
          isPrimary: true,
          type: "link",
          link: "/me",
        },
      ],
      onClose: () => router.push("/"),
    },
    error: {
      message: "OOPS... SOMETHING WENT WRONG",
      subText: " Your NFT failed to mint. Please try again.",
      buttons: [
        {
          text: "CANCEL",
          isPrimary: false,
          type: "link",
          link: "/",
        },
        {
          text: "TRY AGAIN",
          onClick: () => setModalState(null),
          isPrimary: true,
          type: "button",
        },
      ],
      onClose: () => setModalState(null),
    },
  };

  const moveToUploadAsset = (aboutData: any) => {
    const { title, description, copies, attributes, royalty } = aboutData;
    dispatch({
      type: "MOVE_TO_UPLOAD",
      payload: {
        title,
        description,
        copies,
        attributes,
        royalty,
      },
    });
  };

  const getTransactionFeeEstimate = async (hasCollection) => {
    let transactionFee = 0;
    if (!hasCollection) {
      const collectionExtrinsic = await web3Context.api.tx.nft.createCollection(
        "Litho (default)",
        null,
        null
      );
      const createCollectionFee = await web3Context.api.derive.fees.estimateFee(
        {
          extrinsic: collectionExtrinsic,
          userFeeAssetId: web3Context.account.balances.CPAY.tokenId,
        }
      );
      transactionFee =
        createCollectionFee.toNumber() /
        Math.pow(10, web3Context.account.balances.CPAY.decimalPlaces);
    }

    if (state.nft.copies > 1) {
      const mintSeriesExtrinsic = await web3Context.api.tx.nft.mintSeries(
        1,
        state.nft.copies,
        web3Context.account.address,
        null,
        null,
        null
      );

      const mintSeriesFee = await web3Context.api.derive.fees.estimateFee({
        extrinsic: mintSeriesExtrinsic,
        userFeeAssetId: web3Context.account.balances.CPAY.tokenId,
      });
      transactionFee +=
        mintSeriesFee.toNumber() /
        Math.pow(10, web3Context.account.balances.CPAY.decimalPlaces);
    } else {
      const mintUniqueExtrinsic = await web3Context.api.tx.nft.mintUnique(
        1,
        web3Context.account.address,
        null,
        null,
        null
      );

      const mintUniqueFee = await web3Context.api.derive.fees.estimateFee({
        extrinsic: mintUniqueExtrinsic,
        userFeeAssetId: web3Context.account.balances.CPAY.tokenId,
      });
      transactionFee +=
        mintUniqueFee.toNumber() /
        Math.pow(10, web3Context.account.balances.CPAY.decimalPlaces);
    }

    setTransactionFee(transactionFee);
  };

  const moveToPreview = (uploadData) => {
    const {
      image,
      coverImage,
      storage,
      collectionId,
      fileExtension,
      coverFileExtension,
    } = uploadData;

    dispatch({
      type: "MOVE_TO_PREVIEW",
      payload: {
        /**
         * This is needed because in cases where the user is navigating between tabs and presses Next without actually uploading a new
         * image and since file inputs cannot have a default value, the value of input field will be null but the image is already stored in
         * the reducer state.
         */
        image: image || state.nft.image,
        coverImage: coverImage || state.nft.coverImage,
        storage,
        collectionId,
        extension: fileExtension,
        coverFileExtension,
      },
    });

    getTransactionFeeEstimate(collectionId);
  };

  React.useEffect(() => {
    window.scroll(0, 0);
  }, [state.currentTab]);

  const mint = async () => {
    setModalState("mint");

    let storeOnIPFS;
    if (state.nft.coverImage) {
      storeOnIPFS = {
        name: state.nft.title,
        description: state.nft.description,
        image: state.nft.coverImage,
        properties: {
          file: state.nft.image,
          quantity: state.nft.copies,
          creator: web3Context.account.address,
          extension: state.nft.extension,
          coverFileExtension: state.nft.coverFileExtension,
        },
      };
    } else {
      storeOnIPFS = {
        name: state.nft.title,
        description: state.nft.description,
        image: state.nft.image,
        properties: {
          quantity: state.nft.copies,
          creator: web3Context.account.address,
          extension: state.nft.extension,
        },
      };
    }

    try {
      // upload file to ipfs and pin
      const data = new FormData();
      data.append("file", storeOnIPFS.image);
      const imageMetadata = JSON.stringify({
        name: storeOnIPFS.name,
        keyvalues: {
          description: storeOnIPFS.description,
          creator: (storeOnIPFS.properties as any).creator,
          quantity: (storeOnIPFS.properties as any).quantity,
          extension: state.nft.extension,
        },
      });
      data.append("pinataMetadata", imageMetadata);

      const imagePinPromise = await fetch(
        `${process.env.NEXT_PUBLIC_PINATA_PIN_ENDPOINT}/pinning/pinFileToIPFS`,
        {
          method: "POST",
          body: data,
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
          },
        }
      ).then((res) => res.json());

      // upload other file, if any, to ipfs and pin
      let filePinPromise;
      if (storeOnIPFS.properties && (storeOnIPFS.properties as any).file) {
        const otherFileData = new FormData();
        otherFileData.append("file", (storeOnIPFS.properties as any).file);
        const otherFileMetadata = JSON.stringify({
          name: storeOnIPFS.name,
          keyvalues: {
            description: storeOnIPFS.description,
            coverImage: `ipfs://${imagePinPromise.IpfsHash}`,
            creator: (storeOnIPFS.properties as any).creator,
            quantity: (storeOnIPFS.properties as any).quantity,
            extension: state.nft.extension,
            coverFileExtension: state.nft.coverFileExtension,
          },
        });

        otherFileData.append("pinataMetadata", otherFileMetadata);
        filePinPromise = await fetch(
          `${process.env.NEXT_PUBLIC_PINATA_PIN_ENDPOINT}/pinning/pinFileToIPFS`,
          {
            method: "POST",
            body: otherFileData,
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
            },
          }
        ).then((res) => res.json());
      }

      // If the image is undefined, then should not go ahead to mint nft
      if (
        imagePinPromise === undefined ||
        imagePinPromise.IpfsHash === undefined
      ) {
        throw new Error("Error with image upload to ipfs");
      }

      const metadata = {
        name: storeOnIPFS.name,
        description: storeOnIPFS.description,
        image: `ipfs://${imagePinPromise.IpfsHash}`,
        properties: {
          ...((storeOnIPFS.properties as any).file
            ? { file: `ipfs://${filePinPromise.IpfsHash}` }
            : {}),
          quantity: (storeOnIPFS.properties as any).quantity,
          creator: (storeOnIPFS.properties as any).creator,
          extension: state.nft.extension,
          coverFileExtension: state.nft.coverFileExtension,
        },
      };

      const metadataPinPromise = await fetch(
        `${process.env.NEXT_PUBLIC_PINATA_PIN_ENDPOINT}/pinning/pinJSONToIPFS`,
        {
          method: "POST",
          body: JSON.stringify(metadata),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
          },
        }
      ).then((res) => res.json());

      // upload metadata json to ipfs
      const metadataBaseURI = "ipfs";

      const nftAttributes = [
        ...state.nft.attributes,
        { Url: `Metadata ipfs://${metadataPinPromise.IpfsHash}` },
      ];

      let collectionExtrinsic, useCollectionId;
      setModalState("signTransaction");
      if (collectionId !== null && collectionId !== undefined) {
        collectionExtrinsic = null;
        useCollectionId = collectionId;
      } else {
        const collectionId_ = (
          await web3Context.api.query.nft.nextCollectionId()
        ).toNumber();
        useCollectionId = collectionId_;
        collectionExtrinsic = web3Context.api.tx.nft.createCollection(
          state.nft.collectionName,
          metadataBaseURI,
          null
        );
      }

      if (state.nft.copies > 1) {
        let tokenArgs: { [index: string]: any } = {
          collectionId: useCollectionId,
          quantity: state.nft.copies,
          owner: web3Context.account.address,
          attributes: nftAttributes,
          metadataPath: `ipfs://${metadataPinPromise.IpfsHash}`,
        };
        if (state.nft.royalty > 0) {
          tokenArgs.royaltiesSchedule = {
            entitlements: [
              [web3Context.account.address, state.nft.royalty * 10000],
            ],
          };
        }
        await mintNFTSeriesAndCollection(
          web3Context.api,
          web3Context.account,
          tokenArgs,
          collectionExtrinsic,
          () => setModalState("txInProgress")
        );
      } else {
        let tokenArgs: { [index: string]: any } = {
          collectionId: useCollectionId,
          owner: web3Context.account.address,
          attributes: nftAttributes,
          metadataPath: `ipfs://${metadataPinPromise.IpfsHash}`,
        };

        if (state.nft.royalty > 0) {
          tokenArgs.royaltiesSchedule = {
            entitlements: [
              [web3Context.account.address, state.nft.royalty * 10000],
            ],
          };
        }
        await mintNFTAndCollection(
          web3Context.api,
          web3Context.account,
          tokenArgs,
          collectionExtrinsic,
          () => setModalState("txInProgress")
        );
      }
      setModalState("success");
    } catch (error) {
      setModalState("error");
      throw new Error(error);
    }
    return;
  };

  return (
    <div className="border border-litho-black mt-7 mb-6 flex flex-col">
      <Text variant="h3" component="h3" className="text-center py-4">
        Create NFTs
      </Text>
      <div className="border-t border-b border-black flex items-center h-14">
        <Text
          variant="h5"
          component="button"
          className={`w-1/3 h-full p-2 text-center ${
            state.currentTab === 1 ? "bg-litho-black" : "bg-litho-cream"
          }`}
          color={
            state.currentTab === 1
              ? "white"
              : state.isAboutFilled
              ? "litho-black"
              : "litho-gray4"
          }
          onClick={
            state.isAboutFilled
              ? () =>
                  dispatch({ type: "GO_TO_TAB", payload: { currentTab: 1 } })
              : null
          }
        >
          1. About
        </Text>
        <Text
          variant="h5"
          component="button"
          className={`w-1/3 h-full p-2 text-center border-l border-r border-litho-black ${
            state.currentTab === 2 ? "bg-litho-black" : "bg-litho-cream"
          }`}
          color={
            state.currentTab === 2
              ? "white"
              : state.isUploadFilled
              ? "litho-black"
              : "litho-gray4"
          }
          onClick={
            state.isUploadFilled
              ? () =>
                  dispatch({ type: "GO_TO_TAB", payload: { currentTab: 2 } })
              : null
          }
        >
          2. Upload Assets
        </Text>
        <Text
          variant="h5"
          component="button"
          className={`w-1/3 h-full p-2 text-center ${
            state.currentTab === 3 ? "bg-litho-black" : "bg-litho-cream"
          }`}
          color={
            state.currentTab === 3
              ? "white"
              : state.isUploadFilled
              ? "litho-black"
              : "litho-gray4"
          }
          onClick={
            state.isUploadFilled
              ? () =>
                  dispatch({ type: "GO_TO_TAB", payload: { currentTab: 3 } })
              : null
          }
        >
          3. Preview
        </Text>
      </div>
      <div className="bg-grid p-12 flex-1 overflow-auto relative min-h-create">
        <div className="absolute top-28 transform -rotate-6 hidden lg:block">
          <Image src="/create-1.png" height="106" width="65" alt="" />
        </div>
        <div className="absolute bottom-28 left-32 hidden lg:block">
          <Image src="/create-2.png" height="85" width="80" alt="" />
        </div>

        <div className="absolute right-6 top-64 rotate-45 transform hidden lg:block">
          <Image src="/create-3.png" height="17" width="150" alt="" />
        </div>

        {state.currentTab === 1 && (
          <About moveToUploadAsset={moveToUploadAsset} nft={state.nft} />
        )}
        {state.currentTab === 2 && (
          <Upload
            moveToPreview={moveToPreview}
            nft={state.nft}
            goBack={() =>
              dispatch({ type: "GO_TO_TAB", payload: { currentTab: 1 } })
            }
          />
        )}
        {state.currentTab === 3 && (
          <Preview
            nft={state.nft}
            mint={mint}
            transactionFee={transactionFee}
            goBack={() =>
              dispatch({ type: "GO_TO_TAB", payload: { currentTab: 2 } })
            }
          />
        )}
      </div>
      {modalState && (
        <Modal
          onClose={modalStates[modalState].onClose}
          hideClose={modalStates[modalState].hideClose}
          styles={{
            modalBody: "w-3/6 flex flex-col",
            modalContainer: "z-10",
          }}
          disableOutsideClick
        >
          <Text variant="h4" color="litho-blue" component="h2" className="mb-6">
            {modalStates[modalState].message}
          </Text>
          <Text
            variant="body1"
            color="black"
            className="mt-2 border-b border-black border-opacity-20 pb-6"
          >
            {modalStates[modalState].subText}
          </Text>
          <div className="self-end flex items-center mt-8 space-x-4">
            {modalStates[modalState].buttons &&
              modalStates[modalState].buttons.length > 0 &&
              modalStates[modalState].buttons.map((button) => {
                if (button.type === "button") {
                  return (
                    <button
                      className={`${
                        button.isPrimary
                          ? "rounded-sm bg-litho-blue text-white"
                          : ""
                      } px-4 py-3 uppercase`}
                      onClick={button.onClick}
                      key={button.text}
                    >
                      <Text
                        variant="button"
                        color={`${button.isPrimary ? "white" : "litho-blue"}`}
                      >
                        {button.text}
                      </Text>
                    </button>
                  );
                }
                return (
                  <Link href={button.link} key={button.text}>
                    <a
                      className={`${
                        button.isPrimary
                          ? "rounded-sm bg-litho-blue"
                          : "text-litho-blue"
                      } px-4 py-3 uppercase`}
                    >
                      <Text
                        variant="button"
                        color={`${button.isPrimary ? "white" : "litho-blue"}`}
                      >
                        {button.text}
                      </Text>
                    </a>
                  </Link>
                );
              })}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Create;
