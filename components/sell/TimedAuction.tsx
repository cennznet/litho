import React, { useCallback, useMemo } from "react";
import Link from "next/link";

import Text from "../Text";
import Web3Context from "../Web3Context";
import Image from "next/image";
import TokenSelect from "./Select";
import Input from "../Input";
import { EnhancedTokenId } from "@cennznet/types/interfaces/nft/enhanced-token-id";
import { SupportedAssetInfo } from "../SupportedAssetsProvider";
import dayjs from "dayjs";
import { BLOCK_TIME } from "../../pages/sell";
import TxStatusModal from "./TxStatusModal";

const openAuction = async (
  api,
  account,
  tokenId,
  paymentAssetId,
  priceInUnit,
  duration
) => {
  const extrinsic = await api.tx.nft.auction(
    tokenId,
    paymentAssetId,
    priceInUnit,
    duration
  );

  return new Promise((resolve, reject) => {
    extrinsic
      .signAndSend(account.signer, account.payload, ({ status }) => {
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
interface Props {
  collectionId: number;
  seriesId: number;
  serialNumber: number;
  supportedAssets: SupportedAssetInfo[];
}
const TimedAuction: React.FC<Props> = ({
  collectionId,
  seriesId,
  serialNumber,
  supportedAssets,
}) => {
  const [txMessage, setTxMessage] = React.useState<any>();
  const [reservedPrice, setReservedPrice] = React.useState("-1");
  const [convertedRate, setConvertedRate] = React.useState("-1");
  const web3Context = React.useContext(Web3Context);

  const [error, setError] = React.useState(null);
  const [paymentAsset, setPaymentAsset] = React.useState<SupportedAssetInfo>();

  const [modalState, setModalState] = React.useState<string>();

  React.useEffect(() => {
    if (supportedAssets && supportedAssets.length > 0) {
      if (!paymentAsset) {
        setPaymentAsset(supportedAssets[0]);
      }
    }
  }, [supportedAssets]);

  React.useEffect(() => {
    const price = web3Context.cennzUSDPrice;
    if (
      reservedPrice !== "-1" &&
      price &&
      paymentAsset &&
      paymentAsset.symbol === "CENNZ"
    ) {
      const conversionRateCal = Number(reservedPrice) * price;
      let conversionRate = "-1";
      if (!isNaN(conversionRateCal)) {
        conversionRate = conversionRateCal.toFixed(2);
      }
      setConvertedRate(conversionRate);
    } else if (paymentAsset && paymentAsset.symbol !== "CENNZ") {
      setConvertedRate("-1");
    }
  }, [reservedPrice, paymentAsset, web3Context.cennzUSDPrice]);

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

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const { price, endDate } = e.currentTarget;

      const priceInUnit = +price.value * 10 ** paymentAsset.decimals;
      if (priceInUnit <= 0) {
        setError("Please provide a proper price");
        return;
      }
      let duration = null;
      if (endDate.value) {
        var dateParts = endDate.value.split("/");

        if (dateParts.length < 3) {
          setError("Please provide a valid end date");
          return;
        }
        const now = dayjs();
        const end_date = dayjs(
          new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`)
        );
        if (!end_date.isValid()) {
          setError("Please provide a valid end date");
          return;
        }
        const duration_in_sec = end_date.diff(now, "s");
        duration = duration_in_sec / BLOCK_TIME;
        if (duration <= 0) {
          setError("Please provide a future end date");
          return;
        }
      }
      if (web3Context.api) {
        try {
          setModalState("txInProgress");
          await openAuction(
            web3Context.api,
            web3Context.account,
            tokenId,
            paymentAsset.id,
            priceInUnit,
            duration
          );
          setModalState("success");
          setTxMessage("New auction created");
        } catch (e) {
          setModalState("error");
          setTxMessage("Creating auction failed");
        }
      }
    },
    [paymentAsset, web3Context.api, web3Context.account]
  );

  return (
    <>
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
            selectedToken={paymentAsset}
            supportedAssets={supportedAssets}
            onTokenSelected={setPaymentAsset}
          />

          <label>
            <Text variant="h6">Reserve price (in {paymentAsset?.symbol})</Text>
          </label>
          <Input
            name="price"
            type="text"
            placeholder={`Enter your price in ${paymentAsset?.symbol}`}
            defaultValue={reservedPrice !== "-1" ? reservedPrice : ""}
            onChange={(val) => {
              setReservedPrice(val.target.value);
            }}
          />
          {convertedRate !== "-1" ? (
            <>
              <Text variant="caption" className="w-full text-opacity-60 mb-5">
                (~{convertedRate}) USD
              </Text>
            </>
          ) : (
            <>
              <Text variant="caption" className="w-full text-opacity-60 mb-5">
                Service fee 0% (waived)
              </Text>
            </>
          )}
        </div>

        <div className={`h-auto py-4 flex flex-col overflow-hidden`}>
          <label>
            <Text variant="h6">Auction end date</Text>
          </label>
          <Input name="endDate" type="text" placeholder="DD/MM/YYYY" />
          <Text variant="caption" className="w-full text-opacity-60 mb-10">
            By default, the auction will be closed after 3 days.
          </Text>
        </div>

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
      {modalState && (
        <TxStatusModal
          successLink={`/nft/${collectionId}/${seriesId}/${serialNumber}`}
          errorLink={`/nft/${collectionId}/${seriesId}/${serialNumber}`}
          modalState={modalState}
          setModalState={setModalState}
          message={txMessage}
        />
      )}
    </>
  );
};

export default TimedAuction;
