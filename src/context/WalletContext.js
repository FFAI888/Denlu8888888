import React, { createContext, useState } from "react";

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  return (
    <WalletContext.Provider value={{ walletAddress, setWalletAddress, isVerified, setIsVerified }}>
      {children}
    </WalletContext.Provider>
  );
};
