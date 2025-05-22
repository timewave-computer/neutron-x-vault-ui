"use client";
import { grazOptions, wagmiConfig } from "@/config";
import { GrazProvider } from "graz";
import { createContext, useContext, useState, ReactNode } from "react";
import { WagmiProvider } from "wagmi";

interface ConnectWalletModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ConnectWalletModalContext = createContext<
  ConnectWalletModalContextType | undefined
>(undefined);

export function ConnectWalletModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <ConnectWalletModalContext.Provider
      value={{ isOpen, openModal, closeModal }}
    >
      {/* EVM */}
      <WagmiProvider config={wagmiConfig}>
        {/* Cosmos */}
        <GrazProvider grazOptions={grazOptions}>{children}</GrazProvider>
      </WagmiProvider>
    </ConnectWalletModalContext.Provider>
  );
}

export function useWalletModal() {
  const context = useContext(ConnectWalletModalContext);
  if (context === undefined) {
    throw new Error(
      "useWalletModal must be used within a ConnectWalletModalProvider",
    );
  }
  return context;
}
