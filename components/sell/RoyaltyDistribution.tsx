import React from "react";
import Link from "next/link";

import Text from "../Text";
import Web3Context from "../Web3Context";

import { ReactComponent as AlertIcon } from "../../public/error_alert.svg";
import { ReactComponent as CheckedIcon } from "../../public/checked.svg";
import { ReactComponent as UncheckedIcon } from "../../public/unchecked.svg";
import { ReactComponent as CloseIcon } from "../../public/close.svg";

interface Props {
  onNumbOfRoyaltiesChanged: (num: number) => void;
  onRoyaltiesChanged: (royalties: Royalty[]) => void;
}

export type Royalty = {
  account: string;
  percentage: number;
};

const RoyaltyDistribution: React.FC<Props> = ({
  onNumbOfRoyaltiesChanged,
  onRoyaltiesChanged,
}) => {
  const [numOfRoyalties, setNumOfRoyalties] = React.useState(1);
  const [royalties, setRoyalties] = React.useState<Royalty[]>([]);
  const [error, setError] = React.useState(null);
  const [isSplitRoyaltyChecked, setIsSplitRoyaltyChecked] =
    React.useState(true);
  const [remainingPercentage, setRemainingPercentage] = React.useState(0);

  const onRemoveRoyalty = (index) => {
    let newPercentage = 0;
    if (isSplitRoyaltyChecked) {
      if (royalties.length - 1 > 0) {
        newPercentage = Math.round(100 / (royalties.length - 1));
      } else {
        newPercentage = 100;
      }
    }
    const newRoyaltyList = [];
    royalties.forEach((r, i) => {
      if (i !== index) {
        newRoyaltyList.push({
          ...r,
          percentage: newPercentage,
        });
      }
    });

    setRoyalties(newRoyaltyList);
    setNumOfRoyalties(numOfRoyalties - 1 < 0 ? 0 : numOfRoyalties - 1);
    onNumbOfRoyaltiesChanged(numOfRoyalties - 1 < 0 ? 0 : numOfRoyalties - 1);
    onRoyaltiesChanged(newRoyaltyList);
  };

  const onRoyaltyAccountChange = (value, index) => {
    let percentage = 0;
    if (isSplitRoyaltyChecked) {
      if (royalties.length > 0) {
        percentage = Math.round(100 / numOfRoyalties);
      } else {
        percentage = 100;
      }
      setRemainingPercentage(0);
    } else {
      const currentPercentage = royalties.reduce(
        (sum, { percentage }) => sum + percentage,
        0
      );
      setRemainingPercentage(100 - currentPercentage);
    }
    if (royalties.length < numOfRoyalties) {
      setRoyalties([
        ...royalties,
        {
          account: value,
          percentage,
        },
      ]);
      return;
    }
    const newRoyaltyList = royalties.map((royalty, i) => {
      if (i === index) {
        return {
          account: value,
          percentage,
        };
      }
      return {
        ...royalty,
        percentage,
      };
    });
    setRoyalties(newRoyaltyList);
    onRoyaltiesChanged(newRoyaltyList);
  };

  const onRoyaltyDistributionChange = (value, index) => {
    const newRoyaltyList = royalties.map((royalty, i) => {
      if (i === index) {
        return {
          ...royalty,
          percentage: +value,
        };
      }
      return royalty;
    });
    const currentPercentage = newRoyaltyList.reduce(
      (sum, { percentage }) => sum + percentage,
      0
    );
    setRemainingPercentage(100 - currentPercentage);
    setRoyalties(newRoyaltyList);
    onRoyaltiesChanged(newRoyaltyList);
  };

  const updateIsSplitRoyaltyChecked = () => {
    if (isSplitRoyaltyChecked) {
      setIsSplitRoyaltyChecked(!isSplitRoyaltyChecked);
      return;
    }
    let newPercentage = 0;
    if (royalties.length > 0) {
      newPercentage = Math.round(100 / numOfRoyalties);
    } else {
      newPercentage = 100;
    }
    const newRoyaltyList = royalties.map((royalty) => {
      return {
        ...royalty,
        percentage: newPercentage,
      };
    });
    setIsSplitRoyaltyChecked(!isSplitRoyaltyChecked);
    setRemainingPercentage(0);
    setRoyalties(newRoyaltyList);
  };

  const renderRoyaltyInputs = (num) => {
    const Royalties = [];
    for (let i = 0; i < num; i++) {
      const royalty = royalties[i];
      Royalties.push(
        <div
          className="flex relative w-full items-center justify-between mb-4"
          key={i}
        >
          <div className="flex-1 flex flex-col">
            <Text variant="h6" className="mb-1">{`Royalty ${i + 1}`}</Text>
            <input
              name={`royalty-account-${i + 1}`}
              type="text"
              placeholder="0x966320c807de8dd758177cadbcf..."
              className="border border-litho-black text-base p-4"
              value={royalty?.account ?? ""}
              onChange={(e) => onRoyaltyAccountChange(e.target.value, i)}
            />
          </div>
          <div className="flex-2 flex flex-col">
            <Text variant="h6" className="mb-1">
              Royalty in %
            </Text>
            <input
              name={`royalty-percentage-${i + 1}`}
              type="number"
              placeholder={num === 0 ? "0%" : "Enter % royalty"}
              className="border border-litho-black text-base p-4 text-center"
              value={royalty?.percentage || 0}
              onChange={(e) =>
                !isSplitRoyaltyChecked &&
                onRoyaltyDistributionChange(e.target.value, i)
              }
            />
          </div>
          {i > 0 && (
            <CloseIcon
              className="absolute -right-8 bottom-4 cursor-pointer"
              onClick={() => onRemoveRoyalty(i)}
            />
          )}
        </div>
      );
    }

    return Royalties;
  };

  return (
    <div className="h-auto py-4 flex flex-col overflow-visible">
      <div className="w-full flex items-center justify-between mb-10">
        <label
          className={`border flex-1 inline-flex items-center justify-center py-4 ${
            royalties.length > 0 ? "bg-litho-blue" : "bg-litho-gray4"
          }`}
        >
          <div
            className={`${
              royalties.length > 0 ? "text-litho-blue" : "text-litho-gray4"
            }`}
            onClick={() =>
              royalties.length > 0 && updateIsSplitRoyaltyChecked()
            }
          >
            {isSplitRoyaltyChecked ? (
              <CheckedIcon className="fill-current text-white" />
            ) : (
              <UncheckedIcon className="fill-current text-white" />
            )}
          </div>
          <span className="ml-2 text-white">Split royalities evenly</span>
        </label>
        <div
          className={`border ${
            royalties.length <= 0
              ? "bg-litho-gray4"
              : remainingPercentage === 0
              ? "bg-litho-green"
              : remainingPercentage > 0
              ? "bg-litho-mustard"
              : "bg-litho-red"
          } flex-1 ml-6 inline-flex items-center justify-center py-4`}
        >
          <AlertIcon className="fill-current text-white" />
          <span className="ml-2 text-white">{`${remainingPercentage}% of royalties remain`}</span>
        </div>
      </div>

      {renderRoyaltyInputs(numOfRoyalties)}

      <button
        type="button"
        className={`group hover:bg-litho-blue bg-litho-cream  text-center py-2 border border-black w-56 text-base mt-10`}
        onClick={() => setNumOfRoyalties((num) => num + 1)}
      >
        <Text
          variant="button"
          className="group-hover:text-white text-litho-blue"
        >
          + ADD COLLABORATOR
        </Text>
      </button>
    </div>
  );
};

export default RoyaltyDistribution;
