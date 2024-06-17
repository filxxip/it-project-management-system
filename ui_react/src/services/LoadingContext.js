import { useState, useCallback, useContext, createContext } from "react";
import React from "react";

const LoadingContext = createContext();

export const useLoading = () => {
  return useContext(LoadingContext);
};

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const startLoading = useCallback(() => {
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
