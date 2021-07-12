import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { NFTStorage, toGatewayURL } from "nft.storage";
import { TokenInput } from "nft.storage/dist/src/lib/interface";

import Text from "../components/Text";
import Modal from "../components/Modal";
import About from "../components/create/About";
import Upload from "../components/create/Upload";
import Preview from "../components/create/Preview";
import Web3Context from "../components/Web3Context";
import getFileExtension from "../utils/getFileExtension";
import isImageOrVideo from "../utils/isImageOrVideo";

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
    collectionName: "Litho (default)",
  },
  isAboutFilled: false,
  isUploadFilled: false,
  currentTab: 1,
};

const createCollection = async (
  api,
  account,
  collectionName,
  metadataBaseURI
) => {
  const collectionExtrinsic = await api.tx.nft.createCollection(
    collectionName,
    metadataBaseURI,
    null
  );
  let signer = account.signer;
  let payload = account.payload;
  return new Promise((resolve, reject) => {
    collectionExtrinsic
      .signAndSend(signer, payload, (args) => {
        const createCollectionEvent = args.findRecord(
          "nft",
          "CreateCollection"
        );
        if (createCollectionEvent) {
          const collectionId = createCollectionEvent.event.data[0].toJSON();
          resolve(collectionId);
        }
        if (args.status.isInBlock) {
          console.log(
            `Completed at block hash #${args.status.asInBlock.toString()}`
          );
        }
      })
      .catch((error) => {
        console.log(":( transaction failed", error);
        reject(error);
      });
  });
};

const mintNFT = async (api, account, tokenArgs, setTransactionInProgress) => {
  const { collectionId, owner, attributes, metadataPath, royaltiesSchedule } =
    tokenArgs;
  const mintUniqueExtrinsic = await api.tx.nft.mintUnique(
    collectionId,
    owner,
    attributes,
    metadataPath,
    royaltiesSchedule
  );
  let signer = account.signer;
  let payload = account.payload;
  return new Promise((resolve, reject) => {
    mintUniqueExtrinsic
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

const mintNFTSeries = async (
  api,
  account,
  tokenArgs,
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
  const mintUniqueExtrinsic = await api.tx.nft.mintSeries(
    collectionId,
    quantity,
    owner,
    attributes,
    metadataPath,
    royaltiesSchedule
  );
  let signer = account.signer;
  let payload = account.payload;
  return new Promise((resolve, reject) => {
    mintUniqueExtrinsic
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
      const { image, coverImage, storage, collectionId } = action.payload;
      return {
        ...state,
        nft: {
          ...state.nft,
          image,
          coverImage,
          storage,
          collectionId,
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

  const modalStates = {
    mint: {
      message: "Uploading assets to IPFS",
      subText: "Please wait while the assets are uploaded",
      onClose: () => setModalState(null),
    },
    signTransaction: {
      message: "Sign this transaction in your wallet",
      subText:
        "Confirm the transaction in your wallet to continue, doing this will sign your wallet as the original creator of the NFT",
      onClose: () => setModalState(null),
    },
    txInProgress: {
      message: "Please stay on this page",
      subText:
        "Your asset is being minted as an NFT on CENNZnet. Please stay on the page until it has been successfully minted.",
      onClose: () => setModalState(null),
    },
    success: {
      message: "Congratulations!",
      subText:
        "NFT was successfully minted and should be displayed in your wallet shortly.",
      buttons: [
        {
          text: "View My NFT",
          isPrimary: true,
          type: "link",
          link: "/me",
        },
      ],
      onClose: () => router.push("/"),
    },
    error: {
      message: "Oops... something went wrong",
      subText: " Your NFT failed to be minted. Please try again.",
      buttons: [
        {
          text: "Cancel",
          isPrimary: false,
          type: "link",
          link: "/",
        },
        {
          text: "Try again",
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
    const { image, coverImage, storage, collectionId } = uploadData;

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
      },
    });

    getTransactionFeeEstimate(collectionId);
  };

  React.useEffect(() => {
    window.scroll(0, 0);
  }, [state.currentTab]);

  const mint = async () => {
    setModalState("mint");
    const client = new NFTStorage({
      token: process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY,
    });

    let storeOnIPFS: TokenInput;
    const fileExtension = getFileExtension(state.nft.image.name);
    const fileType = isImageOrVideo(fileExtension);
    if (state.nft.coverImage) {
      storeOnIPFS = {
        name: state.nft.title,
        description: state.nft.description,
        image: state.nft.coverImage,
        properties: {
          file: state.nft.image,
          title: state.nft.title,
          description: state.nft.description,
          quantity: state.nft.copies,
        },
      };
    } else {
      if (fileType === "image") {
        storeOnIPFS = {
          name: state.nft.title,
          description: state.nft.description,
          image: state.nft.image,
          properties: {
            title: state.nft.title,
            description: state.nft.description,
            quantity: state.nft.copies,
          },
        };
      } else if (fileType === "video") {
        storeOnIPFS = {
          name: state.nft.title,
          description: state.nft.description,
          image: new File([""], "no-image", { type: "image/jpg" }),
          properties: {
            video: state.nft.image,
            title: state.nft.title,
            description: state.nft.description,
            quantity: state.nft.copies,
          },
        };
      } else {
        storeOnIPFS = {
          name: state.nft.title,
          description: state.nft.description,
          image: new File([""], "no-image", { type: "image/jpg" }),
          properties: {
            file: state.nft.image,
            title: state.nft.title,
            description: state.nft.description,
            quantity: state.nft.copies,
          },
        };
      }
    }

    const metadata = await client.store(storeOnIPFS);
    console.log(metadata);
    const metadataBaseURI = "ipfs";
    const metadataGatewayURL = toGatewayURL(metadata.url, {
      gateway: "https://ipfs.io/",
    });
    const metadataURL = metadataGatewayURL.href;
    const metadataPath = metadataGatewayURL.pathname;

    const imageGatewayURL = toGatewayURL(metadata.data.image, {
      gateway: "https://ipfs.io/",
    });
    const imageURL = imageGatewayURL.href;
    const imagePath = imageGatewayURL.pathname;

    const nftAttributes = [
      ...state.nft.attributes,
      { URL: `Image-URL ${imageURL}` },
      { URL: `Metadata-URL ${metadataURL}` },
      { Text: `Title ${state.nft.title}` },
      { Text: `Description ${state.nft.description}` },
      { Text: `Quantity ${state.nft.copies}` },
      { Text: `File-Type ${getFileExtension(state.nft.image.name)}` },
      {
        URL: `Video-URL ${
          fileType === "video"
            ? toGatewayURL((metadata.data.properties as any).video, {
                gateway: "https://ipfs.io/",
              })
            : ""
        }`,
      },
    ];

    let collectionId;
    setModalState("signTransaction");
    try {
      if (state.nft.collectionId) {
        collectionId = state.nft.collectionId;
      } else {
        console.log("create collection", state.nft.collectionName);
        collectionId = await createCollection(
          web3Context.api,
          web3Context.account,
          state.nft.collectionName,
          metadataBaseURI
        );
      }

      if (state.nft.copies > 1) {
        let tokenArgs: { [index: string]: any } = {
          collectionId,
          quantity: state.nft.copies,
          owner: web3Context.account.address,
          attributes: nftAttributes,
          metadataPath: metadata.url,
        };
        if (state.nft.royalty > 0) {
          tokenArgs.royaltiesSchedule = {
            entitlements: [
              `${web3Context.account.address}, ${state.nft.royalty * 100000}`,
            ],
          };
        }
        await mintNFTSeries(
          web3Context.api,
          web3Context.account,
          tokenArgs,
          () => setModalState("txInProgress")
        );
      } else {
        let tokenArgs: { [index: string]: any } = {
          collectionId,
          owner: web3Context.account.address,
          attributes: nftAttributes,
          metadataPath: metadata.url,
        };

        if (state.nft.royalty > 0) {
          tokenArgs.royaltiesSchedule = {
            entitlements: [
              `${web3Context.account.address}, ${state.nft.royalty * 100000}`,
            ],
          };
        }
        await mintNFT(web3Context.api, web3Context.account, tokenArgs, () =>
          setModalState("txInProgress")
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
        Create a single NFT
      </Text>
      <div className="border-t border-b border-black flex items-center">
        <Text
          variant="h5"
          component="div"
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
          component="div"
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
          component="div"
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
        <div className="absolute top-28 transform -rotate-6">
          <Image src="/create-1.png" height="106" width="65" alt="" />
        </div>
        <div className="absolute bottom-28 left-32">
          <Image src="/create-2.png" height="85" width="80" alt="" />
        </div>

        <div className="absolute right-6 top-64 rotate-45 transform">
          <Image src="/create-3.png" height="17" width="150" alt="" />
        </div>

        {state.currentTab === 1 && (
          <About moveToUploadAsset={moveToUploadAsset} nft={state.nft} />
        )}
        {state.currentTab === 2 && (
          <Upload moveToPreview={moveToPreview} nft={state.nft} />
        )}
        {state.currentTab === 3 && (
          <Preview
            nft={state.nft}
            mint={mint}
            transactionFee={transactionFee}
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
                      } px-4 py-3`}
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
                      } px-4 py-3`}
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
