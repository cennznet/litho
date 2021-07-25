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
      case "h1":
        return "font-normal";
      case "h2":
        return "font-bold text-5xl";
      case "h3":
        return "font-semibold text-4xl";
      case "h4":
        return "font-bold text-2xl";
      case "h5":
        return "font-bold text-lg";
      case "h6":
        return "font-semibold text-lg";
      case "button":
        return "font-bold text-sm leading-none";
      case "body1":
        return "font-normal text-base leading-6";
      case "body2":
        return "font-normal text-sm";
      case "subtitle1":
        return "font-bold text-base leading-6";
      case "subtitle2":
        return "font-semibold text-sm";
      case "caption":
        return "font-normal text-xs";
      case "overline":
        return "font-semibold text-xs leading-4";
      default:
        return "";
    }
  };

  const customStyles = (variant: string): object => {
    switch (variant) {
      case "h1":
        return {
          fontSize: "52px",
          lineHeight: "65px",
        };
      case "h2":
        return {
          lineHeight: "60px",
          letterSpacing: "-0.5px",
        };
      case "h3":
        return {
          lineHeight: "45px",
        };
      case "h4":
        return {
          lineHeight: "30px",
          letterSpacing: "1px",
        };
      case "h5":
        return {
          lineHeight: "22.5px",
          letterSpacing: "0.05em",
        };
      case "h6":
        return {
          lineHeight: "21.6px",
          letterSpacing: "0.01em",
        };
      case "body2":
      case "subtitle2":
        return {
          lineHeight: "21px",
        };
      case "body1":
        return {
          letterSpacing: "0.01em",
        };
      case "button":
        return {
          lineHeight: "14px",
          letterSpacing: "0.05em",
        };
      case "caption":
        return {
          lineHeight: "18px",
        };
      case "overline":
        return {
          letterSpacing: "1.5px",
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
