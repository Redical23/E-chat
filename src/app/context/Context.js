'use client';
import React, { createContext, useContext, useState } from "react";

export const ModelOpenContext = createContext({});

export const ModelProvider = ({ children }) => {
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [updateAvtarURL, setupdateAvtarURL] = useState("");

  return (
    <ModelOpenContext.Provider
      value={{
        isModelOpen,
        setIsModelOpen,
        updateAvtarURL,
        setupdateAvtarURL,
      }}
    >
      {children}
    </ModelOpenContext.Provider>
  );
};

export const useModelContext = () => useContext(ModelOpenContext);
