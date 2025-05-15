export enum ChainType {
  Evm = "evm",
  Cosmos = "cosmos",
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
  getAddress: () => Promise<string>;
  isWalletConnected: boolean;
  isAvailable: boolean;
};
