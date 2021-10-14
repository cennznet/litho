import React from "react";
import Link from "next/link";

import Text from "../components/Text";
import Web3Context from "../components/Web3Context";
import NFT from "../components/nft";
import NFTRenderer from "../components/nft/NFTRenderer";
import Loader from "../components/Loader";
import getMetadata from "../utils/getMetadata";

const Me: React.FC<{}> = () => {
  const web3Context = React.useContext(Web3Context);
  const [loading, setLoading] = React.useState(false);
  const [nfts, setNFTs] = React.useState([]);

  React.useEffect(() => {
    if (!web3Context.account) return;
    setLoading(true);
    if (web3Context && web3Context.api && web3Context.account) {
      (async () => {
        web3Context.api.isReady.then(async () => {
          const tokensInCollections = await web3Context.api.derive.nft.tokensOf(
            web3Context.account.address
          );
          const userNFTs = [];
          await Promise.all(
            tokensInCollections.map(async (tokens) => {
              if (tokens.length > 0) {
                return Promise.all(
                  tokens.map(async (token) => {
                    return new Promise(async (resolve) => {
                      const collectionId = token.collectionId.toString();
                      const seriesId = token.seriesId.toString();
                      const serialNumber = token.serialNumber.toString();
                      const tokenInfo =
                        await web3Context.api.derive.nft.tokenInfo({
                          collectionId,
                          seriesId,
                          serialNumber,
                        });
                      const { owner, attributes } = tokenInfo;
                      let checkIfSingleIssue = serialNumber === "0";
                      if (serialNumber === "0") {
                        checkIfSingleIssue =
                          await web3Context.api.query.nft.isSingleIssue(
                            collectionId,
                            seriesId
                          );
                      }
                      // Copies in collection is used by NFTRenderer to show name of nfts with 4/5, 5/5 sufix in case of series nft
                      // so for series we set copies as 2 and for unique we keep it 1 (later we can change it to bool)
                      const nft: { [index: string]: any } = {
                        collectionId,
                        seriesId,
                        serialNumber,
                        owner,
                        attributes,
                        copies: checkIfSingleIssue ? 1 : 2, // copies here is just to show it in format 1/2 2/2 (in case of series nfts)
                        showOne: true,
                        tokenId: [collectionId, seriesId, serialNumber],
                      };

                      if (attributes) {
                        const metadata = getMetadata(attributes);
                        if (metadata) {
                          const metadataAttributes = metadata.split(" ");
                          const metaAsObject = metadataAttributes.length > 1;
                          const key = metaAsObject
                            ? metadataAttributes[0].toLowerCase()
                            : "metadata";
                          const value = metaAsObject
                            ? metadataAttributes[1]
                            : metadataAttributes[0];
                          nft[key] = value;
                        }
                      }
                      userNFTs.push(nft);
                      resolve(null);
                    });
                  })
                );
              } else {
                return Promise.resolve();
              }
            })
          );
          setNFTs(userNFTs.filter((nft) => nft.metadata));
          setLoading(false);
        });
      })();
    }
  }, [web3Context.account]);

  return (
    <div className="border border-litho-black mb-6 flex flex-col min-h-litho-app">
      <Text variant="h3" component="h3" className="text-center py-4">
        My Profile
      </Text>
      <div className="border-t border-b border-black flex items-center">
        <Text
          variant="h5"
          component="div"
          className="w-1/2 h-full p-2 text-center bg-litho-black"
          color="white"
        >
          My NFTs
        </Text>
        <Text
          variant="h5"
          component="div"
          className="w-1/2 h-full p-2 text-center bg-litho-cream"
          color="litho-gray4"
        >
          My Collections (coming soon)
        </Text>
      </div>
      <div className="p-12 overflow-auto relative min-h-customScreen2">
        {!web3Context.account && (
          <div className="flex-1 w-full flex flex-col items-center justify-center pt-32">
            <button
              className="bg-litho-blue py-3 w-80 text-center"
              onClick={() => web3Context.connectWallet()}
            >
              <Text variant="button" color="white">
                CONNECT WALLET
              </Text>
            </button>
          </div>
        )}
        <Loader loading={loading} />
        {web3Context.account && !loading && nfts.length === 0 && (
          <div className="flex-1 w-full flex flex-col items-center justify-center pt-32">
            <Text variant="h4" component="h4" className="mb-11">
              You don't have any NFT yet.
            </Text>
            <Link href="/create">
              <a className="bg-litho-blue py-3 w-80 text-center">
                <Text variant="button" color="white">
                  CREATE NFTs
                </Text>
              </a>
            </Link>
          </div>
        )}
        {nfts.length > 0 && (
          <div className="pt-4 grid grid-cols-3 gap-3">
            {nfts.map((nft) => {
              const { image, collectionId, seriesId, serialNumber } = nft;
              return (
                <Link
                  href={`/nft/${collectionId}/${seriesId}/${serialNumber}`}
                  key={`${collectionId}-${seriesId}-${serialNumber}`}
                >
                  <div className="rounded mb-10">
                    <NFT nft={nft} renderer={NFTRenderer} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Me;
