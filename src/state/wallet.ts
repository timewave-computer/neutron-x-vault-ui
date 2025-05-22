import { atom } from "jotai";
import { ChainType } from "@/const";

export const evmWalletAtom = atom<WalletState>();
export const cosmosWalletAtom = atom<WalletState>();

type WalletState = {
  id?: string;
  walletName: string;
  chainType: string;
  logo?: string;
};

export type MinimalWallet = {
  walletName: string;
  walletPrettyName: string;
  walletChainType: ChainType;
  walletInfo: {
    logo?: string;
  };
  connect: (chainId?: string) => Promise<void>;
  disconnect: (chainId?: string) => Promise<void>;
  getAddress: () => Promise<string>;
  isAvailable: boolean;
};
