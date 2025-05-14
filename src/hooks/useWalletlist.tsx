import { useMemo } from "react";
import { useCreateCosmosWallets, useCreateEvmWallets } from "@/hooks";

export const useWalletList = () => {
  const { createCosmosWallets } = useCreateCosmosWallets();
  const { createEvmWallets } = useCreateEvmWallets();

  const walletList = useMemo(() => {
    return [...createCosmosWallets(), ...createEvmWallets()];
  }, [createCosmosWallets, createEvmWallets]);

  return walletList;
};
