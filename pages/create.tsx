import React from "react";
import Image from "next/image";

const Create: React.FC<{}> = () => {
  const [currentTab, setCurrentTab] = React.useState(1);

  return (
    <div className="border border-litho-black mt-7 mb-6 h-customScreen2 flex flex-col">
      <h1 className="text-center text-4xl font-bold py-4">
        Create a single NFT
      </h1>
      <div className="border-t border-b border-black flex items-center">
        <div
          className={`w-1/3 text-2xl p-2 text-center ${
            currentTab === 1
              ? "bg-litho-black text-white"
              : "bg-litho-cream text-litho-gray4"
          }`}
        >
          1. About
        </div>
        <div
          className={`w-1/3 text-2xl p-2 text-center border-l border-r border-black ${
            currentTab === 2
              ? "bg-litho-black text-white"
              : "bg-litho-cream text-litho-gray4"
          }`}
        >
          2. Upload Assets
        </div>
        <div
          className={`w-1/3 text-2xl p-2 text-center ${
            currentTab === 3
              ? "bg-litho-black text-white"
              : "bg-litho-cream text-litho-gray4"
          }`}
        >
          3. Preview
        </div>
      </div>
      <div className="bg-grid p-12 flex-1 overflow-auto relative">
        <div className="absolute top-28 left-16">
          <Image src="/create-1.png" height="135" width="132" alt="" />
        </div>
        <div className="absolute bottom-28 left-20">
          <Image
            src="/create-2.png"
            height="89"
            width="89"
            alt=""
            className="absolute "
          />
        </div>
        <div className="absolute top-40 right-20">
          <Image
            src="/create-3.png"
            height="173"
            width="152"
            alt=""
            className="absolute "
          />
        </div>
      </div>
    </div>
  );
};

export default Create;
