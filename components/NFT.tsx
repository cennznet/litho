import React from "react";
import Image from "next/image";

interface Props {
  aboutNFT: any;
  nftData: any;
}

const NFT: React.FC<Props> = () => {
  return (
    <div
      className="bg-litho-nft m-auto relative flex justify-center"
      style={{ height: "400px", width: "300px" }}
    >
      <div className="w-full h-full bg-litho-nft z-10 p-3 border border-litho-black">
        <img
          src="https://place-puppy.com/300x300"
          height="300"
          width="300"
          className="object-contain object-center"
        />
        <div className="mt-3 flex justify-between items-center">
          <span className="text-lg font-bold">NFT name</span>
          <span className="text-sm font-semibold">x1</span>
        </div>
      </div>
      <div className="absolute w-10/12 h-4 -bottom-4 border border-litho-black bg-litho-nft" />
      <div className="absolute w-11/12 h-4 -bottom-2 border border-litho-black bg-litho-nft" />
    </div>
  );
};

export default NFT;
