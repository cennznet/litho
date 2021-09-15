import React, { useCallback, useMemo } from "react";
import Link from "next/link";

import Text from "../Text";
import Web3Context from "../Web3Context";
import Image from "next/image";
import TokenSelect from "./Select";
import Input from "../Input";
import { ReactComponent as AlertIcon } from "../../public/error_alert.svg";
import { ReactComponent as CheckedIcon } from "../../public/checked.svg";
import { ReactComponent as UncheckedIcon } from "../../public/unchecked.svg";
import { ReactComponent as CloseIcon } from "../../public/close.svg";
import RoyaltyDistribution, { Royalty } from "./RoyaltyDistribution";
import { EnhancedTokenId } from "@cennznet/types/interfaces/nft/enhanced-token-id";
import {
  SupportedAssetInfo,
  useSupportedAssets,
} from "../SupportedAssetsProvider";
import { GetRemaindedTime } from "../../utils/chainHelper";

interface Props {
  collectionId: number;
  seriesId: number;
  serialNumber: number;
}

const FixedPrice: React.FC<Props> = ({
  collectionId,
  seriesId,
  serialNumber,
}) => {
  const web3Context = React.useContext(Web3Context);
  const { supportedAssets } = useSupportedAssets();

  console.log("supportedAssets", supportedAssets);

  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [numOfRoyalties, setNumOfRoyalties] = React.useState(1);
  const [royalties, setRoyalties] = React.useState<Royalty[]>([]);
  const [error, setError] = React.useState(null);
  const [paymentAsset, setPaymentAsset] = React.useState<SupportedAssetInfo>(
    supportedAssets && supportedAssets[0]
  );
  const [isSplitRoyaltyChecked, setIsSplitRoyaltyChecked] =
    React.useState(true);
  const [remainingPercentage, setRemainingPercentage] = React.useState(0);
  const [duration, setDuration] = React.useState<number>(0);

  const tokenId = useMemo(() => {
    if (web3Context.api) {
      const id = new EnhancedTokenId(web3Context.api.registry, [
        collectionId,
        seriesId,
        serialNumber,
      ]);
      return id.toHex();
    }
    return undefined;
  }, [web3Context, collectionId, seriesId, serialNumber]);

  const durationInRealTime = useMemo(() => {
    if (!web3Context.api) {
      return undefined;
    }
    console.log(web3Context.api.consts.babe.expectedBlockTime);
    return GetRemaindedTime(web3Context.api, duration);
  }, [web3Context.api.consts, duration]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const { price } = e.currentTarget;
      const DEFAULT_DECIMALS = 4;
      const priceInUnit = +price.value * 10 ** DEFAULT_DECIMALS;
      if (web3Context.api) {
        const sellExtrinsic = await web3Context.api.tx.nft.sell(
          tokenId,
          null,
          paymentAsset.id,
          priceInUnit,
          duration ?? null
        );

        const sellFee = await web3Context.api.derive.fees.estimateFee({
          extrinsic: sellExtrinsic,
          userFeeAssetId: web3Context.account.balances.CPAY.tokenId,
        });

        return new Promise((resolve, reject) => {
          sellExtrinsic
            .signAndSend(
              web3Context.account.signer,
              web3Context.account.payload,
              ({ status }) => {
                if (status.isInBlock) {
                  resolve(status.asInBlock.toString());
                  console.log(
                    `Completed at block hash #${status.asInBlock.toString()}`
                  );
                }
              }
            )
            .catch((error) => {
              console.log(":( transaction failed", error);
              reject(error);
            });
        });
      }
    },
    [paymentAsset, web3Context.api]
  );

  return (
    <form className="flex flex-col lg:w-3/5 m-auto" onSubmit={handleSubmit}>
      <div className="w-full flex flex-col m-auto">
        {error && (
          <div className="w-full bg-litho-red bg-opacity-25 text-litho-red font-bold p-2 text-base mb-4">
            {error}
          </div>
        )}

        <label>
          <Text variant="h6">Token</Text>
        </label>
        <TokenSelect
          supportedAssets={supportedAssets}
          onTokenSelected={setPaymentAsset}
        />

        <label>
          <Text variant="h6">Price (in {paymentAsset.symbol})</Text>
        </label>
        <Input
          name="price"
          type="number"
          placeholder={`Enter your price in ${paymentAsset.symbol}`}
          min={1}
        />
        <Text variant="caption" className="w-full text-opacity-60 mb-10">
          Service fee 2.5%
        </Text>

        <label>
          <Text variant="h6">Duration (potional)</Text>
        </label>
        <input
          name="royalty"
          type="number"
          placeholder="Block number"
          className="border border-litho-black text-base p-4 w-1/2"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
        {durationInRealTime && (
          <Text variant="caption" className="w-full text-opacity-60 mb-10">
            {`Approximately: ${durationInRealTime.days} days ${durationInRealTime.hours} hours ${durationInRealTime.seconds} seconds`}
          </Text>
        )}
      </div>

      <div
        className="flex item-center"
        onClick={() => setShowAdvanced((val) => !val)}
      >
        <Text variant="h5">Distrubution of Royalties</Text>
        <span className="ml-4 top-1">
          <Image
            src="/arrow.svg"
            height="12"
            width="12"
            className={`transform transition-transform ${
              !showAdvanced ? "rotate-180" : "rotate-0"
            }`}
          />
        </span>
      </div>

      {showAdvanced && (
        <RoyaltyDistribution
          onNumbOfRoyaltiesChanged={setNumOfRoyalties}
          onRoyaltiesChanged={setRoyalties}
        />
      )}

      <div className="w-full flex-col md:flex-row flex items-center justify-between mt-10">
        <Link
          href={`/nft/${collectionId}/${seriesId}/${serialNumber}`}
          passHref
        >
          <a className="md:w-auto border border-litho-blue bg-litho-cream text-center flex-1 py-2">
            <Text variant="button" color="litho-blue">
              CANCEL
            </Text>
          </a>
        </Link>
        <button className="md:w-auto border bg-litho-blue flex-1 mt-4 md:mt-0 md:ml-6 text-center py-2">
          <Text variant="button" color="white">
            SELL
          </Text>
        </button>
      </div>
    </form>
  );
};

export default FixedPrice;
