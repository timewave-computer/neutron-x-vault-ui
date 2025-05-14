import { ChainType, MinimalWallet } from "@/types/wallet";

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
      walletName: "MetaMask",
      walletPrettyName: "MetaMask",
      walletChainType: ChainType.Evm,
      walletInfo: {
        logo: "https://assets.coingecko.com/coins/images/1344/small/metamask.png?1696506784",
      },
      connect: async () => {
        console.log("Connecting to MetaMask...");
      },
      disconnect: async () => {
        console.log("Disconnecting from MetaMask...");
      },
    },
  },
  cosmos: {
    neutron: {
      walletName: "Keplr",
      walletPrettyName: "Keplr",
      walletChainType: ChainType.Cosmos,
      walletInfo: {
        logo: "https://assets.coingecko.com/coins/images/1344/small/metamask.png?1696506784",
      },
      connect: async () => {
        console.log("Connecting to Keplr...");
      },
      disconnect: async () => {
        console.log("Disconnecting from Keplr...");
      },
    },
  },
};
