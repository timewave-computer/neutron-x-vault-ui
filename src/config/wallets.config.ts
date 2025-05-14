export enum WalletType {
  EVM = "evm",
  COSMOS = "cosmos",
}

export interface MinimalWallet {
  displayName: string;
  chainId: string;
  onConnect?: () => Promise<void>;
  address?: string;
  disconnect?: () => Promise<void>;
  walletType: WalletType;
  isConnected: boolean;
  isInstalled: boolean;
}

export interface WalletConfig {
  evm: {
    ethereum: MinimalWallet;
  };
  cosmos: {
    neutron: MinimalWallet;
  };
}

export const walletConfig: WalletConfig = {
  evm: {
    ethereum: {
      displayName: "MetaMask",
      chainId: "1", // Ethereum mainnet
      walletType: WalletType.EVM,
      isConnected: false,
      isInstalled: true, // In reality, this would be checked dynamically
      onConnect: async () => {
        console.log("Connecting to MetaMask...");
      },
      disconnect: async () => {
        console.log("Disconnecting from MetaMask...");
      },
    },
  },
  cosmos: {
    neutron: {
      displayName: "Keplr",
      chainId: "neutron-1", // Neutron mainnet
      walletType: WalletType.COSMOS,
      isConnected: false,
      isInstalled: true, // In reality, this would be checked dynamically
      onConnect: async () => {
        console.log("Connecting to Keplr...");
      },
      disconnect: async () => {
        console.log("Disconnecting from Keplr...");
      },
    },
  },
};
