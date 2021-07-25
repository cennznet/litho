import React, { PropsWithChildren } from "react";

import DeviceContext from "./DeviceContext";

// Using code from https://github.com/haldarmahesh/use-mobile-detect-hook
const getMobileDetect = (userAgent: string) => {
  const isAndroid = (): boolean => Boolean(userAgent.match(/Android/i));
  const isIos = (): boolean => Boolean(userAgent.match(/iPhone|iPad|iPod/i));
  const isOpera = (): boolean => Boolean(userAgent.match(/Opera Mini/i));
  const isWindows = (): boolean => Boolean(userAgent.match(/IEMobile/i));
  const isSSR = (): boolean => Boolean(userAgent.match(/SSR/i));

  const isMobile = (): boolean =>
    Boolean(isAndroid() || isIos() || isOpera() || isWindows());
  const isDesktop = (): boolean => Boolean(!isMobile() && !isSSR());
  return {
    isMobile,
    isDesktop,
    isAndroid,
    isIos,
    isSSR,
  };
};

const useMobileDetect = () => {
  const userAgent =
    typeof navigator === "undefined" ? "SSR" : navigator.userAgent;
  return getMobileDetect(userAgent);
};

const DeviceContextProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const detectMobile = useMobileDetect();

  return (
    <DeviceContext.Provider
      value={{
        isChrome: !!(window as any).chrome,
        isMobile: detectMobile.isMobile(),
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export default DeviceContextProvider;
