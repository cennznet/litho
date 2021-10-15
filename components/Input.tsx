import React from "react";

interface Props {
  onChange?: (val) => void;
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
  onChange = (val) => {},
  ...inputProps
}) => {
  return (
    <input
      type={type}
      onChange={onChange}
      className={`border border-litho-black text-base p-4 ${className}`}
      {...inputProps}
    />
  );
};

export default Input;
