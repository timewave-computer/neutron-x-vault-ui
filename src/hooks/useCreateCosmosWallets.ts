import { useCallback } from "react";
import { MinimalWallet } from "@/types/wallet";
import { WalletType, checkWallet, getWallet } from "graz";
export const useCreateCosmosWallets = () => {
  const createCosmosWallets = useCallback(() => {
    const wallets: MinimalWallet[] = [];
    const cosmosWallets = getAvailableWallets();

    cosmosWallets.forEach((wallet) => {});

    return wallets;
  }, []);

  return {
    createCosmosWallets,
  };
};

const getAvailableWallets = () => {
  const browserWallets = [
    WalletType.KEPLR,
    WalletType.LEAP,
    WalletType.COSMOSTATION,
    WalletType.XDEFI,
    WalletType.STATION,
    WalletType.VECTIS,
    WalletType.WALLETCONNECT,
  ];

  return browserWallets;
};
