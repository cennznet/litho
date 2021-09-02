import React from "react";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import useSWR from "swr";

import NFT from "../components/NFT";
import Text from "../components/Text";

const Sort: React.FC<{ onChange: (sort: string) => void }> = ({ onChange }) => {
  const [sortSelected, setSortSelected] = React.useState(0);
  const [showSortList, setShowSortList] = React.useState(false);
  const sorters = [
    {
      name: "newest-first",
      text: "Newest First",
    },
    {
      name: "oldest-first",
      text: "Oldest First",
    },
  ];

  return (
    <>
      {showSortList && (
        <div className="fixed w-screen h-screen bg-litho-cream bg-opacity-80 top-0 left-0 z-20" />
      )}
      <div className="relative w-56 z-20 cursor-pointer">
        <div
          onClick={() => setShowSortList((val) => !val)}
          className={`border border-black px-2 py-1 flex justify-between items-center ${
            showSortList ? "bg-white" : "bg-litho-cream"
          }`}
        >
          <Text variant="subtitle1">{sorters[sortSelected].text}</Text>
          <Image
            src="/arrow.svg"
            height="10"
            width="10"
            className={`transform transition-transform ${
              !showSortList ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
        {showSortList && (
          <div className="absolute w-full">
            {sorters.map((sort, index) => {
              return (
                <div
                  className="border border-black px-2 py-1 flex items-center justify-between"
                  onClick={() => {
                    setSortSelected(index);
                    onChange(sort.name);
                    setShowSortList(false);
                  }}
                  key={sort.name}
                >
                  <Text variant="subtitle1">{sort.text}</Text>
                  {sortSelected === index && (
                    <Image
                      src="/black-tick.svg"
                      height="20"
                      width="20"
                      className={`transform transition-transform ${
                        !showSortList ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

const MarketplaceNFT: React.FC<{ nft: any }> = ({ nft }) => {
  const [nftDetails, setNFTDetails] = React.useState(nft);

  const { data, error } = useSWR(!nft.image ? nft.metadata : null);

  React.useEffect(() => {
    if (data) {
      setNFTDetails({ ...nftDetails, ...data });
    }
  }, [data]);

  if (!nftDetails.image) {
    return null;
  }

  return <NFT nft={nftDetails} />;
};

const MarketPlace: React.FC<{}> = () => {
  const [nfts, setNFTs] = React.useState([]);
  const [pageEnd, setPageEnd] = React.useState(10);
  const { ref, inView, entry } = useInView({
    threshold: 1,
  });
  const [sort, setSort] = React.useState("newest-first");

  React.useEffect(() => {
    (async () => {
      const res = await fetch("/api/getAllNFTs").then((res) => res.json());
      const sortedNFTs = res.nfts.sort((n1, n2) => {
        if (n1.close > n2.close) {
          return sort === "oldest-first" ? 1 : -1;
        } else if (n1.close < n2.close) {
          return sort === "oldest-first" ? -1 : 1;
        } else {
          return 0;
        }
      });
      setNFTs(sortedNFTs);
    })();
  }, []);

  React.useEffect(() => {
    if (entry && entry.isIntersecting && nfts.length > 0) {
      setPageEnd((val) => val + 10);
    }
  }, [inView]);
  React.useEffect(() => {
    if (nfts.length > 0) {
      const sortedNFTs = nfts.sort((n1, n2) => {
        if (n1.close > n2.close) {
          return sort === "oldest-first" ? 1 : -1;
        } else if (n1.close < n2.close) {
          return sort === "oldest-first" ? -1 : 1;
        } else {
          return 0;
        }
      });
      setNFTs(sortedNFTs);
      setPageEnd(10);
    }
  }, [sort]);

  return (
    <div>
      <div className="flex lg:items-center justify-between mb-20 flex-col lg:flex-row">
        <Text variant="h3" className="mb-4 lg:mb-0">
          Marketplace
        </Text>
        <Sort
          onChange={(val) => {
            setSort(val);
          }}
        />
      </div>
      <div className="grid grid-row lg:grid-cols-4 gap-5 grid-flow-4">
        {nfts.map((nft, index) => {
          if (index > pageEnd) {
            return null;
          }

          return <MarketplaceNFT nft={nft} key={nft.listingId} />;
        })}
      </div>
      {nfts.length > 10 && <div id="sentinel" ref={ref} />}
    </div>
  );
};

export default MarketPlace;
