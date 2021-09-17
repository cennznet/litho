import dynamic from "next/dynamic";

const NFT = dynamic(import("./NFTDataWrapper"), { ssr: false });

export default NFT;
