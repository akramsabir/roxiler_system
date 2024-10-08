import React, { createContext, useState } from 'react';

export const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [apiURL] = useState('http://localhost:4001/');
  const [apiHeaderJson] = useState({ 'Content-Type': "application/json", })
  const [apiHeaderFile] = useState({ 'Content-Type': "multipart/form-data", })

  var vals = {
    apiURL,
    apiHeaderJson,
    apiHeaderFile,
  };
  return (
    <ConfigContext.Provider value={vals}>
      {children}
    </ConfigContext.Provider>
  );
};
