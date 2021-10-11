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
                const tokensInCollection = {};
                tokens.forEach(async (token) => {
                  const { collectionId, seriesId } = token;
                  const seriesLevelKey = `${collectionId}-${seriesId}`;
                  if (tokensInCollection.hasOwnProperty(seriesLevelKey)) {
                    tokensInCollection[seriesLevelKey].count += 1;
                  } else {
                    tokensInCollection[seriesLevelKey] = {
                      token,
                      count: 1,
                    };
                  }
                });

                return Promise.all(
                  Object.values(tokensInCollection).map(
                    async ({ token, count }) => {
                      return new Promise(async (resolve) => {
                        const tokenInfo =
                          await web3Context.api.derive.nft.tokenInfo({
                            collectionId: token.collectionId.toJSON(),
                            seriesId: token.seriesId.toJSON(),
                            serialNumber: 0,
                          });
                        const { owner, attributes } = tokenInfo;
                        const nft: { [index: string]: any } = {
                          collectionId: token.collectionId.toJSON(),
                          seriesId: token.seriesId.toJSON(),
                          serialNumber: 0,
                          owner,
                          attributes: attributes,
                          copies: count,
                        };

                        if (attributes) {
                          const metadata = getMetadata(attributes);
                          if (metadata) {
                            const metadataAttributes = metadata.split(" ");
                            const key = metadataAttributes[0].toLowerCase();
                            const value = metadataAttributes[1];
                            nft[key] = value;
                          }
                        }
                        userNFTs.push(nft);
                        resolve(null);
                      });
                    }
                  )
                );
              } else {
                return Promise.resolve();
              }
            })
          );
          // console.log('user nfts:', userNFTs);
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
