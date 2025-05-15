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
  connect: (chainId?: string) => Promise<{ address: string }>;
  disconnect: (chainId?: string) => Promise<void>;
  getAddress: () => Promise<string>;
  isAvailable: boolean;
};
