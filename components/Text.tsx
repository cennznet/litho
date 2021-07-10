import React from "react";

interface TextProps {
  component?: keyof JSX.IntrinsicElements;
  variant?: string;
  color?: string;
  className?: string;
  onClick?: () => void;
}

const Text: React.FC<React.PropsWithChildren<TextProps>> = ({
  children,
  component = "span",
  variant = "body1",
  color = "litho-black",
  className = "",
  onClick = () => {},
}) => {
  const getVariantTypography = (variant: string): string => {
    switch (variant) {
      case "h3":
        return "font-semibold text-5xl";
      case "h4":
        return "font-bold";
      case "h5":
        return "font-bold text-2xl";
      case "h6":
        return "font-medium text-xl";
      case "button":
        return "font-semibold text-base leading-none";
      case "body1":
        return "font-light text-base leading-none";
      case "body2":
        return "font-light text-base";
      case "subtitle1":
        return "font-semibold text-base leading-6";
      case "caption":
        return "font-normal text-xs";
      default:
        return "";
    }
  };

  const customStyles = (variant: string): object => {
    switch (variant) {
      case "h1":
        return {
          lineHeight: "120px",
        };
      case "h2":
        return {
          lineHeight: "75px",
          letterSpacing: "-0.5px",
        };
      case "h3":
        return {
          lineHeight: "60px",
        };
      case "h4":
        return {
          lineHeight: "42.5px",
          fontSize: "34px",
        };
      case "h5":
        return {
          lineHeight: "30px",
          letterSpacing: "0.01em",
        };
      case "h6":
        return {
          lineHeight: "25px",
          letterSpacing: "0.02em",
        };
      case "body2":
      case "subtitle2":
        return {
          lineHeight: "21px",
          fontSize: "14px",
        };
      case "body1":
        return {
          letterSpacing: "0.01em",
        };
      case "button":
        return {
          letterSpacing: "0.05em",
        };
      case "caption":
        return {
          lineHeight: "18px",
          letterSpacing: "0.04em",
        };
      default:
        return {};
    }
  };

  const typography = getVariantTypography(variant);

  const Component = component;

  return (
    <Component
      className={`${typography} text-${color} ${className}`}
      style={customStyles(variant)}
      onClick={onClick}
    >
      {children}
    </Component>
  );
};

export default Text;
