import React from "react";
import Link from "next/link";

import Text from "../components/Text";

const Me: React.FC<{}> = () => {
  return (
    <div className="border border-litho-black mt-7 mb-6 flex flex-col">
      <Text variant="h3" component="h3" className="text-center py-4">
        My NFTs
      </Text>
      <div className="border-t border-b border-black flex items-center">
        <Text
          variant="h5"
          component="div"
          className="w-1/2 h-full p-2 text-center bg-litho-black"
          color="white"
        >
          Single NFTs
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
        <div className="flex-1 w-full flex flex-col items-center justify-center pt-32">
          <Text variant="h4" component="h4" className="mb-11">
            You don't have any NFT yet.
          </Text>
          <Link href="/create">
            <a className="bg-litho-blue py-3 w-80 text-center">
              <Text variant="button" color="white">
                Create an NFT
              </Text>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Me;
