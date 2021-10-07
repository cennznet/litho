import React from "react";

const DeviceContext = React.createContext({
  isMobile: null,
  isChrome: true,
  isFirefox: true,
});

export default DeviceContext;
