export enum ChainType {
  Cosmos = "cosmos",
  Evm = "evm",
  Svm = "svm",
}

export type MinimalWallet = {
  walletName: string;
  walletPrettyName: string;
  walletChainType: ChainType;
  walletInfo: {
    logo?: string;
  };
  connect: (chainId?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  isWalletConnected: boolean;
  isAvailable: boolean;
};
