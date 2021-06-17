import React from "react";
import Image from "next/image";

const Home: React.FC<{}> = () => {
  return (
    <div>
      <div className="mt-12 mb-16 border border-litho-black bg-litho-cream flex">
        <div className="w-1/3 text-5xl p-10" style={{ lineHeight: "60px" }}>
          <span className="font-bold">Litho</span> discovers, collects and sells
          extraordinary NFTs
        </div>
        <div className="w-1/3 border-l border-r border-litho-black flex flex-col relative h-customScreen">
          <Image
            src="/placeholder.png"
            className="flex-1 max-w-full max-h-full"
            objectFit="cover"
            priority={true}
            layout="fill"
          />

          <div className="p-6 pb-10 flex flex-col">
            <span className="text-2xl mb-4 font-bold">Create an NFT</span>
            <button className="bg-litho-blue w-40 h-12 text-white flex items-center justify-center font-semibold">
              Start Minting
            </button>
          </div>
        </div>
        <div className="w-1/3 border-l border-r border-litho-black flex flex-col relative h-customScreen">
          <Image
            src="/placeholder.png"
            className="flex-1 max-w-full max-h-full"
            objectFit="cover"
            priority={true}
            layout="fill"
          />

          <div className="p-6 pb-10 flex flex-col">
            <span className="text-2xl mb-4 font-bold">Marketplace</span>
            <span className="h-12 flex items-center text-litho-blue text-opacity-60 font-semibold">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
      {/* <div className="w-full flex items-center justify-center mb-16">
        <div className="w-1/2 flex justify-center">
          <Image src="/placeholder.png" height={400} width={400} />
        </div>
        <div className="p-6 pb-10 flex flex-col w-1/2">
          <span className="text-3xl font-bold">Join the hype</span>
          <span className="h-12 text-xl leading-6 my-4">
            Subscribe to our exclusive mailing list and be the first to know
            when new NFTs drop.
          </span>
          <div className="h-14 w-full flex">
            <input
              className="h-full flex-1 border border-litho-black px-4"
              placeholder="Enter email here"
            />
            <button className="text-white bg-litho-blue px-4">Subscribe</button>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Home;
