import { useCallback } from "react";
import { ChainType, MinimalWallet } from "@/types/wallet";
import { WalletType, getWallet, connect, useDisconnect } from "graz";
import { walletInfo } from "@/const/graz";
import { getChainInfo } from "@/const/chains";

export const useCreateCosmosWallets = () => {
  const { disconnectAsync } = useDisconnect();

  const createCosmosWallets = useCallback(() => {
    const wallets: MinimalWallet[] = [];
    const cosmosWallets = getAvailableWallets();

    cosmosWallets.forEach((walletType) => {
      const walletInfo = getCosmosWalletInfo(walletType);

      const connectWallet = async ({
        chainIdToConnect = "neutron-1",
      }: {
        chainIdToConnect?: string;
      }) => {
        const chainInfo = getChainInfo(chainIdToConnect);
        const wallet = getWallet(walletType);
        if (!wallet) {
          throw new Error("Wallet not found");
        }

        if (walletType === WalletType.KEPLR && !!chainInfo) {
          await wallet.experimentalSuggestChain(chainInfo);
        }
        const response = await connect({
          chainId: chainIdToConnect,
          walletType: walletType,
          autoReconnect: false,
        });

        if (!response?.accounts) {
          throw new Error("failed to get accounts from wallet");
        }

        const address =
          chainIdToConnect &&
          response?.accounts[chainIdToConnect].bech32Address;

        if (!address) {
          throw new Error("failed to get address from wallet");
        }

        return { address };
      };

      const minimalWallet: MinimalWallet = {
        walletName: walletInfo.name,
        walletPrettyName: walletInfo.name,
        walletChainType: ChainType.Cosmos,
        walletInfo: {
          logo: walletInfo.imgSrc,
        },
        isAvailable: (() => {
          try {
            const w = getWallet(walletType);
            return Boolean(w);
          } catch (_error) {
            return false;
          }
        })(),
        connect: async (chainId?: string) => {
          return await connectWallet({ chainIdToConnect: chainId });
        },
        disconnect: async (chainId?: string) => {
          return disconnectAsync({ chainId });
        },
        getAddress: async (chainId?: string) => {
          if (!chainId) {
            throw new Error("chainId is required");
          }
          const address = (await getWallet(walletType).getKey(chainId))
            .bech32Address;
          return address;
        },
      };

      wallets.push(minimalWallet);
    });

    return wallets;
  }, []);

  return {
    createCosmosWallets,
  };
};

const getAvailableWallets = () => {
  const browserWallets = [WalletType.KEPLR, WalletType.LEAP, WalletType.OKX];

  return browserWallets;
};

export const getCosmosWalletInfo = (walletType: WalletType) => {
  return walletInfo[walletType];
};
