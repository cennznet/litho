import React from "react";

import getFileExtension from "../../utils/getFileExtension";
import isImageOrVideo from "../../utils/isImageOrVideo";
import ConvertImage from "../ConvertImageWebp";

interface Props {
  nft: any;
  error?: string;
}

const NFTRenderer: React.FC<Props> = ({ nft, error }) => {
  const image = nft.coverImage || nft.image;
  const [imageUrl, setImageUrl] = React.useState(null);
  const [fileExtension, setFileExtension] = React.useState(
    !error && nft.coverFileExtension
      ? nft.coverFileExtension
      : !error && nft.extension
      ? nft.extension
      : null
  );

  React.useEffect(() => {
    if (!error && !fileExtension) {
      (async () => {
        try {
          const res = await fetch(image);
          const contentType = res.headers.get("content-type");
          const extension = getFileExtension(contentType);
          setFileExtension(extension);
        } catch (error) {
          console.log(error);
        }
      })();
    }
  }, []);

  React.useEffect(() => {
    if (fileExtension) {
      let url;

      if (!image || !fileExtension || !isImageOrVideo(fileExtension) || error) {
        url = "/litho-default.jpg";
      } else if (typeof image === "object") {
        url = URL.createObjectURL(image);
      } else {
        url = image;
      }
      setImageUrl(url);
    }
  }, [fileExtension]);

  if (!imageUrl && !error) {
    return null;
  }

  return (
    <div
      className="bg-litho-nft relative flex justify-center"
      // style={{ height: "400px", width: "300px" }}
    >
      <div className="w-full h-full bg-litho-nft z-10 p-3 border border-litho-black">
        <div className="relative flex items-center justify-center">
          {isImageOrVideo(fileExtension) === "video" ? (
            <video
              src={imageUrl}
              height="300"
              controls
              autoPlay
              width="300"
              loop
              controlsList="nodownload"
              className="object-contain object-center h-72 w-72 bg-litho-black bg-no-repeat bg-center"
            />
          ) : (
            <ConvertImage
              imageUrl={imageUrl}
              className="object-contain object-center h-72 w-72 bg-image-loading bg-no-repeat bg-center m-auto"
              onLoad={(event) => {
                if (event.target) {
                  (event.target as HTMLImageElement).classList.remove(
                    "bg-image-loading"
                  );
                }
              }}
              onError={(event) => {
                (event.target as HTMLImageElement).src = "/litho-default.jpg";
              }}
            />
          )}

          {error && (
            <span className="text-red-500 text-center text-xl absolute w-3/4 break-all">
              {error}
            </span>
          )}
        </div>
        <div className="mt-3 flex justify-between items-center">
          <span
            className="text-lg font-bold break-all mr-4"
            style={{ lineHeight: "21.6px", maxWidth: 300 }}
          >
            {nft.title || nft.name || ""}
          </span>
          <span
            className="text-sm font-semibold"
            style={{ lineHeight: "18px" }}
          >
            x{nft.copies || 1}
          </span>
        </div>
        {nft.owner && (
          <div
            className="break-all text-sm mt-2"
            style={{ lineHeight: "24px" }}
          >
            {nft.owner.substr(0, 20)}...
          </div>
        )}
      </div>
      {nft.copies && nft.copies > 1 && (
        <>
          <div className="absolute w-10/12 h-4 -bottom-4 border border-litho-black bg-litho-nft" />
          <div className="absolute w-11/12 h-4 -bottom-2 border border-litho-black bg-litho-nft" />
        </>
      )}
    </div>
  );
};

export default NFTRenderer;
