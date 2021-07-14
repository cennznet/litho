import React from "react";
import Image from "next/image";
import Link from "next/link";

import Text from "../components/Text";
import Modal from "../components/Modal";

const Home: React.FC<{}> = () => {
  const [showViewOnDesktop, setShowViewOnDesktop] = React.useState(false);
  return (
    <div className="lg:border border-litho-black bg-litho-cream flex flex-col lg:flex-row h-full">
      <div className="bg-litho-mustard px-3 py-2 flex justify-center mb-4 item-start lg:hidden">
        <img src="/info.svg" alt="" className="h-5 mr-2" />
        <Text variant="body2" className="flex-1">
          Please view on desktop for a better user experience
        </Text>
      </div>
      <div className="w-1/3 p-6 xl:p-10 hidden lg:block">
        <Text variant="h3">Litho</Text>{" "}
        <span className="text-5xl font-normal" style={{ lineHeight: "60px" }}>
          discovers, collects and sells extraordinary NFTs
        </span>
      </div>
      <div className="px-6 py-8 border border-litho-black mb-4 lg:hidden">
        <Text variant="h4">
          Litho discovers, collects and sells extraordinary NFTs
        </Text>{" "}
      </div>
      <div className="w-full lg:w-1/3 border lg:border-0 lg:border-l lg:border-r border-litho-black flex flex-col relative mb-4 lg:mb-0 min-h-litho-body">
        <div className="flex-1 relative">
          <Image
            src="/start-minting.png"
            objectFit="cover"
            priority={true}
            layout="fill"
            objectPosition="center"
          />
        </div>

        <div className="p-6 pb-10 flex flex-col">
          <Text variant="h5" className="mb-4">
            Create an NFT
          </Text>
          <Link href="/create">
            <a className="bg-litho-blue w-40 h-12 flex items-center justify-center hidden lg:flex">
              <Text variant="button" color="white">
                Start Minting
              </Text>
            </a>
          </Link>
          <button
            className="bg-litho-blue w-40 h-12 flex items-center justify-center lg:hidden"
            onClick={() => setShowViewOnDesktop(true)}
          >
            <Text variant="button" color="white">
              Start Minting
            </Text>
          </button>
        </div>
      </div>
      <div className="w-full lg:w-1/3 flex flex-col relative border lg:border-0 border-litho-black">
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
      {showViewOnDesktop && (
        <Modal
          onClose={() => setShowViewOnDesktop(false)}
          disableOutsideClick={true}
          styles={{ modalBody: "w-11/12", modalContainer: "z-20" }}
        >
          <Text variant="h4" color="litho-blue">
            Minting is only available on Desktop
          </Text>
        </Modal>
      )}
    </div>
  );
};

export default Home;
