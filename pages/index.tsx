import React from "react";
import Image from "next/image";
import Text from "../components/Text";

const Home: React.FC<{}> = () => {
  return (
    <div className="mt-12 mb-16 border border-litho-black bg-litho-cream flex">
      <div className="w-1/3 p-10">
        <Text variant="h3">Litho</Text>{" "}
        <span className="text-5xl font-normal" style={{ lineHeight: "60px" }}>
          discovers, collects and sells extraordinary NFTs
        </span>
      </div>
      <div className="w-1/3 border-l border-r border-litho-black flex flex-col relative h-customScreen">
        <div className="flex-1 relative">
          <Image
            src="/placeholder.png"
            objectFit="cover"
            priority={true}
            layout="fill"
          />
        </div>

        <div className="p-6 pb-10 flex flex-col">
          <Text variant="h5" className="mb-4">
            Create an NFT
          </Text>
          <button className="bg-litho-blue w-40 h-12 flex items-center justify-center">
            <Text variant="button" color="white">
              Start Minting
            </Text>
          </button>
        </div>
      </div>
      <div className="w-1/3 border-l border-r border-litho-black flex flex-col relative h-customScreen">
        <div className="flex-1 relative">
          <Image
            src="/placeholder.png"
            objectFit="cover"
            priority={true}
            layout="fill"
          />
        </div>

        <div className="p-6 pb-10 flex flex-col">
          <Text variant="h5" className="mb-8">
            Marketplace
          </Text>
          <Text
            variant="button"
            color="litho-blue"
            className="flex items-center text-opacity-60 mb-4"
          >
            Coming Soon
          </Text>
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
