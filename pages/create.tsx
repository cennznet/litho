import React from "react";
import Image from "next/image";

import Text from "../components/Text";
import About from "../components/create/About";
import Upload from "../components/create/Upload";
import Preview from "../components/create/Preview";

import { NFTStorage, toGatewayURL } from "nft.storage";
import Web3Context from "../components/Web3Context";

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
          console.log("newCollectionId", collectionId);
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

const mintNFT = async (api, account, tokenArgs) => {
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

const mintNFTSeries = async (api, account, tokenArgs) => {
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
  const web3Context = React.useContext(Web3Context);
  const [state, dispatch] = React.useReducer<React.Reducer<State, Action>>(
    createReducer,
    initialState
  );
  const [transactionFee, setTransactionFee] = React.useState<number>();

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
    const client = new NFTStorage({
      token: process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY,
    });

    const metadata = await client.store({
      name: state.nft.title || "Litho NFT",
      description: state.nft.description || state.nft.title || "Litho NFT",
      image: state.nft.image,
    });

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
    ];

    let collectionId;

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

    // if (state.nft.copies > 1) {
    //   let tokenArgs: { [index: string]: any } = {
    //     collectionId,
    //     quantity: state.nft.copies,
    //     owner: web3Context.account.address,
    //     attributes: nftAttributes,
    //     metadataPath: metadata.url,
    //   };
    //   if (state.nft.royalty > 0) {
    //     tokenArgs.royaltiesSchedule = {
    //       entitlements: [
    //         `${web3Context.account.address}, ${state.nft.royalty * 100000}`,
    //       ],
    //     };
    //   }
    //   await mintNFTSeries(web3Context.api, web3Context.account, tokenArgs);
    // } else {
    //   let tokenArgs: { [index: string]: any } = {
    //     collectionId,
    //     owner: web3Context.account.address,
    //     attributes: nftAttributes,
    //     metadataPath: metadata.url,
    //   };

    //   if (state.nft.royalty > 0) {
    //     tokenArgs.royaltiesSchedule = {
    //       entitlements: [
    //         `${web3Context.account.address}, ${state.nft.royalty * 100000}`,
    //       ],
    //     };
    //   }
    //   await mintNFT(web3Context.api, web3Context.account, tokenArgs);
    // }
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
    </div>
  );
};

export default Create;
