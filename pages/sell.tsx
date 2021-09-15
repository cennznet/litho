import React from "react";
import { useRouter } from "next/router";

import Web3Context from "../components/Web3Context";
import Text from "../components/Text";
import { ReactComponent as MoneyIcon } from "../public/money.svg";
import { ReactComponent as HourglassIcon } from "../public/hourglass.svg";
import { ReactComponent as CatIcon } from "../public/cat.svg";
import FixedPrice from "../components/sell/FixedPrice";
import TimedAuction from "../components/sell/TimedAuction";
import Bid from "../components/sell/Bid";
import { useSupportedAssets } from "../components/SupportedAssetsProvider";

const Sell: React.FC<{}> = () => {
  const router = useRouter();
  const web3Context = React.useContext(Web3Context);
  const { supportedAssets } = useSupportedAssets();
  const { collectionId, seriesId, serialNumber } = router.query;

  if (!supportedAssets) {
    router.push(`/nft/${collectionId}/${seriesId}/${serialNumber}`);
  }

  const [currentTab, setCurrentTab] = React.useState<number>(1);

  return (
    <div className="border border-litho-black mt-7 mb-6 flex flex-col">
      <Text variant="h3" component="h3" className="text-center py-4">
        Sell on marketplace
      </Text>

      <div className="border-t border-litho-black bg-grid p-12 flex-1 overflow-auto relative min-h-create">
        <div className="flex items-center justify-between lg:w-3/5 h-28 mt-16 m-auto mb-8">
          <button
            className={`h-28 w-48 py-7 border border-litho-blue flex-col flex items-center justify-between ${
              currentTab === 1 ? "bg-litho-blue" : "bg-litho-cream"
            }`}
            onClick={() => setCurrentTab(1)}
          >
            <MoneyIcon
              className={`fill-current mr-2 ${
                currentTab === 1 ? "text-white" : "text-litho-blue"
              }`}
            />
            <Text
              variant="h5"
              component="div"
              color={`${currentTab === 1 ? "white" : "litho-blue"}`}
            >
              Fixed Price
            </Text>
          </button>
          <button
            className={`h-28 w-48 py-6 border border-litho-blue flex-col flex items-center justify-between ${
              currentTab === 2 ? "bg-litho-blue" : "bg-litho-cream"
            }`}
            onClick={() => setCurrentTab(2)}
          >
            <HourglassIcon
              className={`fill-current mr-2 ${
                currentTab === 2 ? "text-white" : "text-litho-blue"
              }`}
            />
            <Text
              variant="h5"
              component="div"
              color={`${currentTab === 2 ? "white" : "litho-blue"}`}
            >
              TIMED AUCTION
            </Text>
          </button>
          <button
            className={`h-28 w-48 py-7 border border-litho-blue flex-col flex items-center justify-between ${
              currentTab === 3 ? "bg-litho-blue" : "bg-litho-cream"
            }`}
            onClick={() => setCurrentTab(3)}
          >
            <CatIcon
              className={`fill-current mr-2 ${
                currentTab === 3 ? "text-white" : "text-litho-blue"
              }`}
            />
            <Text
              variant="h5"
              component="div"
              color={`${currentTab === 3 ? "white" : "litho-blue"}`}
            >
              OPEN FOR BIDS
            </Text>
          </button>
        </div>
        {currentTab === 1 && (
          <FixedPrice
            collectionId={Number(router.query.collectionId)}
            seriesId={Number(router.query.seriesId)}
            serialNumber={Number(router.query.serialNumber)}
          />
        )}
        {currentTab === 2 && (
          <TimedAuction
            collectionId={Number(router.query.collectionId)}
            seriesId={Number(router.query.seriesId)}
            serialNumber={Number(router.query.serialNumber)}
          />
        )}
        {currentTab === 3 && (
          <Bid
            collectionId={Number(router.query.collectionId)}
            seriesId={Number(router.query.seriesId)}
            serialNumber={Number(router.query.serialNumber)}
          />
        )}
      </div>
    </div>
  );
};

export default Sell;
