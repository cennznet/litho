import React from "react";
import Link from "next/link";

interface Props {
  moveToPreview: (nftData: any) => void;
}

const Upload: React.FC<Props> = ({ moveToPreview }) => {
  const submitHandler: React.FormEventHandler<HTMLFormElement> = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const { file, storage } = event.currentTarget;

    moveToPreview({
      image: file.files[0],
      storage: storage.value,
    });
  };
  return (
    <form
      className="flex flex-col w-3/5 m-auto text-xl"
      onSubmit={submitHandler}
    >
      <span>Upload Assets</span>
      <label
        htmlFor="file"
        className="border border-litho-black p-4 mb-6 text-base bg-white text-opacity-25 text-litho-black mb-10"
      >
        Choose from folder
      </label>
      <input name="file" type="file" className="hidden" id="file" />
      <label>Choose content storage</label>
      <select
        className="border border-litho-black p-4 mb-6 text-base bg-white text-opacity-75 text-litho-black mb-10 cursor-not-allowed"
        disabled
        name="storage"
        defaultValue={"ipfs"}
      >
        <option value="ipfs">IPFS</option>
      </select>

      <div className="w-full flex items-center justify-between mt-10">
        <Link href="/">
          <a className="border bg-litho-cream text-base text-litho-blue flex-1 text-center py-2">
            Cancel
          </a>
        </Link>
        <button className="border bg-litho-blue text-base text-white flex-1 ml-6 text-center py-2">
          Next: Preview
        </button>
      </div>
    </form>
  );
};

export default Upload;
