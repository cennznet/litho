import React from "react";

const DeviceContext = React.createContext({
  isMobile: null,
  isChrome: true,
});

export default DeviceContext;
