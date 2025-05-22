import { useCallback } from "react";
import { MinimalWallet } from "@/state";
import { ChainType, walletInfo } from "@/const";
import { WalletType, getWallet, connect, useDisconnect } from "graz";
import { getChainInfo, defaultCosmosChainId } from "@/config";
import { cosmosWalletAtom } from "@/state";
import { useAtom } from "jotai";

export const useCreateCosmosWallets = () => {
  const { disconnectAsync } = useDisconnect();
  const [, setCosmosWallet] = useAtom(cosmosWalletAtom);
  const createCosmosWallets = useCallback(() => {
    const wallets: MinimalWallet[] = [];
    const cosmosWallets = getAvailableWallets();

    cosmosWallets.forEach((walletType) => {
      const walletInfo = getCosmosWalletInfo(walletType);

      const connectWallet = async ({
        chainIdToConnect = defaultCosmosChainId,
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

        setCosmosWallet({
          id: walletType,
          walletName: walletInfo.name,
          chainType: ChainType.Cosmos,
          logo: walletInfo.imgSrc,
        });
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
          await connectWallet({ chainIdToConnect: chainId });
        },
        disconnect: async (chainId?: string) => {
          await disconnectAsync({ chainId });
          setCosmosWallet(undefined);
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
