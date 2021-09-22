import React from "react";

interface Props {
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string | number;
  min?: number;
  id?: string;
  maxLength?: number;
  max?: number;
  className?: string;
}

const Input: React.FC<Props> = ({
  type = "text",
  className,
  ...inputProps
}) => {
  return (
    <input
      type={type}
      className={`border border-litho-black text-base p-4 ${className}`}
      {...inputProps}
    />
  );
};

export default Input;
