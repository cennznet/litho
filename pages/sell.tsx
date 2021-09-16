import React, { useMemo } from "react";
import { useRouter } from "next/router";

import Web3Context from "../components/Web3Context";
import Text from "../components/Text";
import { ReactComponent as MoneyIcon } from "../public/money.svg";
import { ReactComponent as HourglassIcon } from "../public/hourglass.svg";
import { ReactComponent as CatIcon } from "../public/cat.svg";
import FixedPrice from "../components/sell/FixedPrice";
import TimedAuction from "../components/sell/TimedAuction";
import SupportedAssetsContext from "../components/SupportedAssetsContext";

export const BLOCK_TIME = 5;

const Sell: React.FC<{}> = () => {
  const router = useRouter();
  const web3Context = React.useContext(Web3Context);
  const supportedAssetContext = React.useContext(SupportedAssetsContext);

  const supportedAssets = useMemo(() => {
    return supportedAssetContext.supportedAssets;
  }, [supportedAssetContext]);

  const { collectionId, seriesId, serialNumber } = router.query;

  const [currentTab, setCurrentTab] = React.useState<number>(1);

  return (
    <div className="border border-litho-black mt-7 mb-6 flex flex-col">
      <Text variant="h3" component="h3" className="text-center py-4">
        Sell on marketplace
      </Text>
      {!web3Context.account ? (
        <div className="flex-1 w-full flex flex-col items-center justify-center pt-32">
          <button
            className="bg-litho-blue py-3 w-80 text-center mb-10"
            onClick={() => web3Context.connectWallet()}
          >
            <Text variant="button" color="white">
              CONNECT WALLET
            </Text>
          </button>
        </div>
      ) : (
        <div className="border-t border-litho-black bg-grid p-12 flex-1 overflow-auto relative min-h-create">
          <div className="flex items-center justify-between lg:w-3/5 h-28 mt-16 m-auto mb-8">
            <button
              className={`h-28 w-80 py-7 border border-litho-blue flex-col flex items-center justify-between ${
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
              className={`h-28 w-80 py-6 border border-litho-blue flex-col flex items-center justify-between ${
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
          </div>
          {currentTab === 1 && (
            <FixedPrice
              collectionId={Number(collectionId)}
              seriesId={Number(seriesId)}
              serialNumber={Number(serialNumber)}
              supportedAssets={supportedAssets}
            />
          )}
          {currentTab === 2 && (
            <TimedAuction
              collectionId={Number(collectionId)}
              seriesId={Number(seriesId)}
              serialNumber={Number(serialNumber)}
              supportedAssets={supportedAssets}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Sell;
