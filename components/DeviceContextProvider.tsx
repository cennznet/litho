import React, { PropsWithChildren } from "react";
import useMobileDetect from "use-mobile-detect-hook";

import DeviceContext from "./DeviceContext";

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
