"use client";
import { wagmiConfig } from "@/config";
import { allSupportedCosmosChains } from "@/const/chains";
import { GrazProvider } from "graz";
import { createContext, useContext, useState, ReactNode } from "react";
import { WagmiProvider } from "wagmi";

interface WalletModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const WalletModalContext = createContext<WalletModalContextType | undefined>(
  undefined,
);

export function WalletModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <WalletModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {/* EVM */}
      <WagmiProvider config={wagmiConfig}>
        {/* Cosmos */}
        <GrazProvider
          grazOptions={{
            chains: allSupportedCosmosChains,
            chainsConfig: {
              "neutron-1": {
                gas: {
                  price: "0.005",
                  denom: "untrn",
                },
              },
              "sim-neutron-1": {
                gas: {
                  price: "0.005",
                  denom: "untrn",
                },
              },
            },
          }}
        >
          {children}
        </GrazProvider>
      </WagmiProvider>
    </WalletModalContext.Provider>
  );
}

export function useWalletModal() {
  const context = useContext(WalletModalContext);
  if (context === undefined) {
    throw new Error("useWalletModal must be used within a WalletModalProvider");
  }
  return context;
}
