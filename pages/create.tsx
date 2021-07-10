import React from "react";
import Image from "next/image";

import Text from "../components/Text";
import About from "../components/create/About";
import Upload from "../components/create/Upload";
import Preview from "../components/create/Preview";

import { NFTStorage, toGatewayURL } from "nft.storage";
import Web3Context from "../components/Web3Context";

type NFT = {
  title: string;
  description?: string;
  copies: number;
  collectionName?: string;
  collectionId?: number;
  image: any;
  attributes: Array<{ [index: string]: string }>;
  royalty: number;
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

const Create: React.FC<{}> = () => {
  const [currentTab, setCurrentTab] = React.useState(1);
  const [nft, setNFT] = React.useState<NFT>();
  const web3Context = React.useContext(Web3Context);

  const moveToUploadAsset = (aboutData: any) => {
    setNFT(aboutData);
    setCurrentTab((tab) => tab + 1);
  };

  const moveToPreview = (uploadData) => {
    setNFT((currentVal) => ({ ...currentVal, ...uploadData }));
    setCurrentTab((tab) => tab + 1);
  };

  const mint = async () => {
    const client = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY });

    const metadata = await client.store({
      name: nft.title || "Litho NFT",
      description: nft.description || nft.title || "Litho NFT",
      image: nft.image,
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
      ...nft.attributes,
      { URL: `Image-URL ${imageURL}` },
      { URL: `Metadata-URL ${metadataURL}` },
      { Text: `Title ${nft.title}` },
      { Text: `Description ${nft.description}` },
      { Text: `Quantity ${nft.copies}` },
    ];

    let collectionId;

    if (nft.collectionId) {
      collectionId = nft.collectionId;
    } else {
      console.log("create collection", nft.collectionName);
      collectionId = await createCollection(
        web3Context.api,
        web3Context.account,
        nft.collectionName,
        metadataBaseURI
      );
    }

    if (nft.copies > 1) {
      let tokenArgs: { [index: string]: any } = {
        collectionId,
        quantity: nft.copies,
        owner: web3Context.account.address,
        attributes: nftAttributes,
        metadataPath: metadata.url,
      };
      if (nft.royalty > 0) {
        tokenArgs.royaltiesSchedule = {
          entitlements: [
            `${web3Context.account.address}, ${nft.royalty * 100000}`,
          ],
        };
      }
      await mintNFTSeries(web3Context.api, web3Context.account, tokenArgs);
    } else {
      let tokenArgs: { [index: string]: any } = {
        collectionId,
        owner: web3Context.account.address,
        attributes: nftAttributes,
        metadataPath: metadata.url,
      };

      if (nft.royalty > 0) {
        tokenArgs.royaltiesSchedule = {
          entitlements: [
            `${web3Context.account.address}, ${nft.royalty * 100000}`,
          ],
        };
      }
      await mintNFT(web3Context.api, web3Context.account, tokenArgs);
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
            currentTab === 1 ? "bg-litho-black" : "bg-litho-cream"
          }`}
          color={currentTab === 1 ? "white" : "litho-gray4"}
        >
          1. About
        </Text>
        <Text
          variant="h5"
          component="div"
          className={`w-1/3 h-full p-2 text-center border-l border-r border-litho-black ${
            currentTab === 2 ? "bg-litho-black" : "bg-litho-cream"
          }`}
          color={currentTab === 2 ? "white" : "litho-gray4"}
        >
          2. Upload Assets
        </Text>
        <Text
          variant="h5"
          component="div"
          className={`w-1/3 h-full p-2 text-center ${
            currentTab === 3 ? "bg-litho-black" : "bg-litho-cream"
          }`}
          color={currentTab === 3 ? "white" : "litho-gray4"}
        >
          3. Preview
        </Text>
      </div>
      <div className="bg-grid p-12 flex-1 overflow-auto relative min-h-create">
        <div className="absolute top-28">
          <Image src="/create-1.png" height="135" width="132" alt="" />
        </div>
        <div className="absolute bottom-28 left-32">
          <Image src="/create-2.png" height="89" width="89" alt="" />
        </div>

        <div className="absolute right-6 top-64">
          <Image src="/create-3.png" height="173" width="152" alt="" />
        </div>

        {currentTab === 1 && <About moveToUploadAsset={moveToUploadAsset} />}
        {currentTab === 2 && <Upload moveToPreview={moveToPreview} />}
        {currentTab === 3 && <Preview nft={nft} mint={mint} />}
      </div>
    </div>
  );
};

export default Create;
