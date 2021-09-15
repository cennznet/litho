import React from "react";
import Image from "next/image";

import Text from "../Text";
import { ReactComponent as CheckIcon } from "../../public/check.svg";
import { SupportedAssetInfo } from "../SupportedAssetsProvider";

interface SelectProps {
  supportedAssets: SupportedAssetInfo[];
  onTokenSelected: (asset: SupportedAssetInfo) => void;
}

const TokenSelect: React.FC<SelectProps> = ({
  supportedAssets,
  onTokenSelected,
}) => {
  const [selectedToken, setSelectedToken] = React.useState<SupportedAssetInfo>(
    supportedAssets[0]
  );
  const [showTokenList, setShowTokenList] = React.useState(false);

  return (
    <>
      {showTokenList && (
        <div className="fixed w-screen h-screen bg-litho-cream bg-opacity-80 top-0 left-0 z-20" />
      )}
      <div className="w-full relative w-56 z-20 cursor-pointer mb-10">
        <div
          onClick={() => setShowTokenList((val) => !val)}
          className={`border border-black px-2 py-4 flex justify-between items-center bg-white`}
        >
          <Text variant="subtitle1">{selectedToken.symbol}</Text>
          <Image
            src="/arrow.svg"
            height="10"
            width="10"
            className={`transform transition-transform ${
              !showTokenList ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
        {showTokenList && (
          <div className="absolute w-full">
            {supportedAssets.map((token, index) => {
              return (
                <div
                  className="group hover:bg-litho-blue border border-black px-2 py-4 flex items-center justify-between"
                  onClick={() => {
                    setSelectedToken(token);
                    onTokenSelected(token);
                    setShowTokenList(false);
                  }}
                  key={token.symbol}
                >
                  <Text variant="subtitle1" className="group-hover:text-white">
                    {token.symbol}
                  </Text>
                  {selectedToken.id === token.id && (
                    <CheckIcon
                      width={20}
                      height={20}
                      className={`fill-current group-hover:text-white transform transition-transform ${
                        !showTokenList ? "rotate-180" : "rotate-0"
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

export default TokenSelect;
