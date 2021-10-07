import React, { useState } from "react";

interface Props {
  loading: boolean;
}

const Loader: React.FC<Props> = ({ loading }) => {
  return (
    loading && (
      <div className="flex-1 w-full flex flex-col items-center justify-center pt-32">
        <img src="/spinner.svg"></img>
      </div>
    )
  );
};

export default Loader;
