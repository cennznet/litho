export default function Home() {
  return (
    <div className="mt-12 mb-16 border border-litho-black bg-litho-cream flex w-full">
      <div className="w-1/3 text-5xl p-10" style={{ lineHeight: "60px" }}>
        <span className="font-bold">Litho</span> discovers, collects and sells
        extraordinary NFTs
      </div>
      <div className="w-1/3 border-l border-r border-litho-black flex flex-col">
        <img
          src="http://placehold.it/100x100"
          className="flex-1 max-w-full max-h-full"
        />

        <div className="p-6 pb-10 flex flex-col">
          <span className="text-2xl mb-4 font-bold">Create an NFT</span>
          <button className="bg-litho-blue w-40 h-12 text-white flex items-center justify-center font-semibold">
            Start Minting
          </button>
        </div>
      </div>
      <div className="w-1/3 border-l border-r border-litho-black flex flex-col">
        <img
          src="http://placehold.it/100x100"
          className="flex-1 max-w-full max-h-full"
        />

        <div className="p-6 pb-10 flex flex-col">
          <span className="text-2xl mb-4 font-bold">Marketplace</span>
          <span className="h-12 flex items-center text-litho-blue text-opacity-60 font-semibold">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}
