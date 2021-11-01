import React from "react";

const Spinner: React.FC<{}> = () => {
  return (
    <div className="flex justify-center items-center">
      <img src="/spinner.svg"></img>
    </div>
  );
};

export default Spinner;
