import React from "react";
import Image from "next/image";

import getFileExtension from "../utils/getFileExtension";
import isImageOrVideo from "../utils/isImageOrVideo";

interface Props {
  nft: any;
}

const NFT: React.FC<Props> = ({ nft }) => {
  let imageUrl;
  const image = nft.coverImage || nft.image;
  const fileExtension = getFileExtension(image.name || image);

  if (!image || !fileExtension || !isImageOrVideo(fileExtension)) {
    imageUrl = "/litho-default.jpg";
  } else {
    if (typeof image === "object") {
      imageUrl = URL.createObjectURL(image);
    } else {
      imageUrl = image;
    }
  }
  return (
    <div
      className="bg-litho-nft m-auto relative flex justify-center"
      style={{ height: "400px", width: "300px" }}
    >
      <div className="w-full h-full bg-litho-nft z-10 p-3 border border-litho-black">
        {typeof nft.image === "object" ? (
          <img
            src={imageUrl}
            height="300"
            width="300"
            className="object-contain object-center h-72 w-72 bg-image-loading bg-no-repeat bg-center"
          />
        ) : (
          <Image
            loader={({ src }) => src}
            src={imageUrl}
            height="300"
            width="300"
            className="object-contain object-center bg-image-loading bg-no-repeat bg-center"
          />
        )}
        <div className="mt-3 flex justify-between items-center">
          <span className="text-lg font-bold" style={{ lineHeight: "21.6px" }}>
            {nft.title}
          </span>
          <span
            className="text-sm font-semibold"
            style={{ lineHeight: "18px" }}
          >
            x{nft.copies}
          </span>
        </div>
      </div>
      <div className="absolute w-10/12 h-4 -bottom-4 border border-litho-black bg-litho-nft" />
      <div className="absolute w-11/12 h-4 -bottom-2 border border-litho-black bg-litho-nft" />
    </div>
  );
};

export default NFT;
