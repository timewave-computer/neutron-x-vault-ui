"use client";
import { MinimalWallet } from "@/state";
import { useAccount, useConnect, useConnectors } from "wagmi";
import { useCallback } from "react";
import { disconnect } from "@wagmi/core";
import { wagmiConfig } from "@/config";
import { ChainType } from "@/const";
import { evmWalletAtom } from "@/state";
import { useAtom } from "jotai";

export const useCreateEvmWallets = () => {
  const {
    connector: currentEvmConnector,
    isConnected: isEvmConnected,
    chainId: accountChainId,
  } = useAccount();
  const { connectAsync } = useConnect();
  const connectors = useConnectors();

  const [, setEvmWallet] = useAtom(evmWalletAtom);

  const createEvmWallets = useCallback(() => {
    const wallets: MinimalWallet[] = [];

    connectors.forEach((connector) => {
      const isWalletFound =
        wallets.findIndex((wallet) => wallet.walletName === connector.id) !==
        -1;
      if (isWalletFound) {
        return;
      }

      const connectWallet = async ({
        chainIdToConnect = "1",
      }: {
        chainIdToConnect?: string;
      }) => {
        const walletConnectedButNeedToSwitchChain =
          isEvmConnected &&
          accountChainId !== Number(chainIdToConnect) &&
          connector.id === currentEvmConnector?.id;
        try {
          if (isEvmConnected && connector.id !== currentEvmConnector?.id) {
            await disconnect(wagmiConfig);
          }
          if (walletConnectedButNeedToSwitchChain) {
            await connector?.switchChain?.({
              chainId: Number(chainIdToConnect),
            });
          }

          await connectAsync({ connector, chainId: Number(chainIdToConnect) });

          setEvmWallet({
            id: connector.id,
            walletName: connector.name,
            chainType: ChainType.Evm,
            logo: connector.icon,
          });
        } catch (e) {
          const error = e as Error;
          console.error(error);
          alert(error.message);
          throw e;
        }
      };

      const minimalWallet: MinimalWallet = {
        walletName: connector.id,
        walletPrettyName: connector.name,
        walletChainType: ChainType.Evm,
        walletInfo: {
          logo: connector.icon,
        },
        isAvailable: true, // available because connector exists for EVM
        connect: async (chainId?: string) => {
          await connectWallet({ chainIdToConnect: chainId });
        },
        disconnect: async () => {
          await disconnect(wagmiConfig);
          setEvmWallet(undefined);
        },
        getAddress: async () => {
          const account = await connector.getAccounts();
          if (!account || account.length === 0) {
            throw new Error("No account found");
          }
          return account[0];
        },
      };

      wallets.push(minimalWallet);
    });

    return wallets;
  }, [
    connectors,
    currentEvmConnector,
    isEvmConnected,
    accountChainId,
    connectAsync,
  ]);

  return {
    createEvmWallets,
  };
};
